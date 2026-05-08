import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CraftWorkflowState, ContinueCraftOutput, Direction } from "../types.js"
import { loadSkill } from "../skills/loader.js"
import { loadDesignSystem } from "../design-systems/loader.js"

const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("answer_project_questions"), answers: z.array(z.string()) }),
  z.object({ type: z.literal("answer_block_questions"), answers: z.array(z.string()) }),
  z.object({ type: z.literal("choose_direction"), direction_id: z.string() }),
  z.object({ type: z.literal("define_more"), details: z.string() }),
  z.object({ type: z.literal("request_design") }),
  z.object({ type: z.literal("approve_block"), block: z.string() }),
  z.object({ type: z.literal("restart_block") }),
])

const StateSchema: z.ZodType<CraftWorkflowState> = z.object({
  phase: z.enum(["project_setup", "block_definition", "direction_choice", "define_or_design", "ready", "block_done", "all_done"]),
  goal: z.string(),
  block_plan: z.array(z.object({ block: z.string(), status: z.enum(["pending", "current", "completed"]) })),
  current_block: z.string().optional(),
  project_context: z.object({
    audience: z.string().optional(),
    tone: z.string().optional(),
    platform: z.enum(["web", "mobile", "both"]).optional(),
    brand_notes: z.string().optional(),
  }).optional(),
  direction: z.object({
    id: z.string(),
    name: z.string(),
    design_system: z.string(),
  }).optional(),
  block_definitions: z.record(z.object({
    primary_action: z.string().optional(),
    notes: z.array(z.string()).optional(),
  })),
  design_md: z.string(),
})

export function registerContinueCraft(server: McpServer) {
  server.tool(
    "continue_craft",
    "The workflow engine. Always pass the full state returned by the previous call. The action type determines the transition. Returns updated state — always pass it forward. Write design_md_patch to DESIGN.md whenever it is present in the response.",
    {
      state: StateSchema,
      action: ActionSchema,
    },
    async ({ state, action }) => {
      const output = await advance(state, action)
      return {
        content: [{ type: "text", text: JSON.stringify(output) }],
      }
    }
  )
}

async function advance(state: CraftWorkflowState, action: z.infer<typeof ActionSchema>): Promise<ContinueCraftOutput> {
  switch (action.type) {
    case "answer_project_questions": {
      const [audience, tone, brandNotes] = action.answers
      const currentBlock = state.block_plan.find(b => b.status === "current")?.block ?? state.block_plan[0].block
      const next: CraftWorkflowState = {
        ...state,
        phase: "block_definition",
        current_block: currentBlock,
        project_context: { audience, tone, brand_notes: brandNotes },
        design_md: appendDesignMd(state.design_md, `## Goal\n${state.goal}\n\n## Project Context\nAudience: ${audience}\nTone: ${tone}${brandNotes ? `\nBrand: ${brandNotes}` : ""}`),
      }
      return {
        state: next,
        questions: blockQuestions(currentBlock),
        hint: `Ask these questions using the host input tool (one at a time), then call continue_craft({ state, action: { type: "answer_block_questions", answers: [...] } })`,
      }
    }

    case "answer_block_questions": {
      const block = state.current_block ?? ""
      const [primaryAction, ...rest] = action.answers
      const updatedDefs = { ...state.block_definitions, [block]: { primary_action: primaryAction, notes: rest } }

      if (!state.direction) {
        const directions = getDirections(state.project_context?.tone)
        const next: CraftWorkflowState = { ...state, phase: "direction_choice", block_definitions: updatedDefs }
        return {
          state: next,
          directions,
          hint: `Present these 3 directions to the user by feel, not by technical spec. Wait for their choice, then call continue_craft({ state, action: { type: "choose_direction", direction_id: "..." } })`,
        }
      }

      const preview = buildPreview(block, primaryAction, state.direction.name)
      const next: CraftWorkflowState = { ...state, phase: "define_or_design", block_definitions: updatedDefs }
      return {
        state: next,
        design_preview: preview,
        hint: `Show the design_preview to the user. Ask: "Does this match what you have in mind? Say 'design it' to start, or describe what you'd change." If they confirm, call continue_craft({ state, action: { type: "request_design" } }). If they want changes, call continue_craft({ state, action: { type: "define_more", details: "..." } })`,
      }
    }

    case "choose_direction": {
      const direction = DIRECTIONS.find(d => d.id === action.direction_id)!
      const block = state.current_block ?? ""
      const primaryAction = state.block_definitions[block]?.primary_action ?? ""
      const preview = buildPreview(block, primaryAction, direction.name)
      const patch = `\n## Direction\n${direction.name}\n\n## Design System\n${direction.design_system}\n`
      const next: CraftWorkflowState = {
        ...state,
        phase: "define_or_design",
        direction,
        design_md: state.design_md + patch,
      }
      return {
        state: next,
        design_md_patch: patch,
        design_preview: preview,
        hint: `Show the design_preview. Ask: "Does this match what you have in mind?" If confirmed, call continue_craft({ state, action: { type: "request_design" } }).`,
      }
    }

    case "define_more": {
      const block = state.current_block ?? ""
      const existing = state.block_definitions[block] ?? {}
      const next: CraftWorkflowState = {
        ...state,
        phase: "block_definition",
        block_definitions: {
          ...state.block_definitions,
          [block]: { ...existing, notes: [...(existing.notes ?? []), action.details] },
        },
      }
      return {
        state: next,
        questions: ["Anything else to clarify before we design?"],
        hint: `Ask the follow-up question, then call continue_craft with answer_block_questions or request_design based on the user's response.`,
      }
    }

    case "request_design": {
      const block = state.current_block ?? ""
      const skill = await loadSkill(block)
      const system = await loadDesignSystem(state.direction?.design_system ?? "linear")
      const blockDef = state.block_definitions[block] ?? {}

      const craftContext = {
        block,
        parent_goal: state.goal,
        brief: {
          primary_action: blockDef.primary_action ?? "",
          audience: state.project_context?.audience,
          tone: state.project_context?.tone,
          notes: blockDef.notes,
        },
        direction: state.direction!,
        tokens: system.tokens,
        constraints: {
          layout_rules: skill.layout_rules,
          component_patterns: skill.component_patterns,
          anti_patterns: skill.anti_patterns,
        },
        design_md_snapshot: state.design_md,
      }

      const patch = `\n### ${block} 🔄\n- Primary action: ${blockDef.primary_action}\n`
      const next: CraftWorkflowState = { ...state, phase: "ready", design_md: state.design_md + patch }

      return {
        state: next,
        craft_context: craftContext,
        design_md_patch: patch,
        hint: `State your execution intent in one sentence, then execute using the available execution tool. After execution, call validate_design({ description: "<what you built>", craft_context }). Do not show output that fails validation — fix violations first.`,
      }
    }

    case "approve_block": {
      const updatedPlan = state.block_plan.map(b =>
        b.block === action.block ? { ...b, status: "completed" as const } :
        b.status === "pending" ? { ...b, status: "current" as const } : b
      )
      // Only set the first pending block as current
      let foundNext = false
      const finalPlan = updatedPlan.map(b => {
        if (b.block === action.block) return b
        if (!foundNext && b.status === "current") { foundNext = true; return b }
        return b
      })

      const nextBlock = finalPlan.find(b => b.status === "current" && b.block !== action.block)
      const allDone = !nextBlock

      const patch = `\n### ${action.block} ✅\n`
      const next: CraftWorkflowState = {
        ...state,
        phase: allDone ? "all_done" : "block_done",
        current_block: nextBlock?.block,
        block_plan: finalPlan,
        design_md: state.design_md + patch,
      }

      return {
        state: next,
        design_md_patch: patch,
        resume_prompt: allDone
          ? "All blocks complete. Your DESIGN.md has the full design record."
          : `${action.block} done. Run /craft to continue with ${nextBlock?.block}.`,
        hint: allDone
          ? "Inform the user the design is complete."
          : `Show the resume_prompt. Write design_md_patch to DESIGN.md. The user will run /craft to continue.`,
      }
    }

    case "restart_block": {
      const directions = getDirections(state.project_context?.tone)
      const next: CraftWorkflowState = { ...state, phase: "direction_choice", direction: undefined }
      return {
        state: next,
        directions,
        hint: `Present these 3 directions. Project-level decisions from DESIGN.md are preserved. Wait for choice, then call continue_craft with choose_direction.`,
      }
    }
  }
}

function appendDesignMd(existing: string, addition: string): string {
  return existing ? `${existing}\n\n${addition}` : `# Project Design Context\n\n${addition}`
}

function blockQuestions(block: string): string[] {
  const map: Record<string, string[]> = {
    "hero-section": [
      "What's the single action the hero needs to drive?",
      "Is the product established or pre-launch?",
      "One headline idea, or should I propose options?",
    ],
    "navigation": [
      "Global navigation to other pages, or in-page anchor links?",
      "Should the nav include a CTA button, or just links?",
    ],
    "pricing-row": [
      "How many tiers? (2–3 recommended)",
      "Which tier should be highlighted as recommended?",
      "Monthly pricing, annual, or both with a toggle?",
    ],
  }
  return map[block] ?? ["Describe what this block needs to do."]
}

function buildPreview(block: string, primaryAction: string, directionName: string): string {
  const previews: Record<string, (action: string, dir: string) => string> = {
    "hero-section": (action, dir) =>
      `A centered hero section. One dominant Display headline — specific to the product brief. Below it, a single solid button: "${action}". Nothing else — no subheadline, no illustration. Generous vertical spacing. ${dir} feel.`,
    "navigation": (action, dir) =>
      `Horizontal navigation bar. Brand mark on the left, primary links in the center, single CTA on the right: "${action}". Sticky on scroll. ${dir} feel.`,
    "pricing-row": (action, dir) =>
      `Side-by-side pricing tiers. One visually elevated as recommended. Price is the dominant text in each card. Single CTA per tier: "${action}". ${dir} feel.`,
  }
  return previews[block]?.(primaryAction, directionName) ?? `A ${block} block designed for: ${primaryAction}.`
}

function getDirections(tone?: string): Direction[] {
  return DIRECTIONS.slice(0, 3)
}

const DIRECTIONS: Direction[] = [
  {
    id: "focused-calm",
    name: "Focused & Calm",
    description: "Clean, restrained, lots of breathing room. Every element earns its place. Feels like Linear or Vercel.",
    reference: "Linear, Vercel",
    design_system: "linear",
    palette_preview: ["#0066FF", "#F7F7F5", "#1A1A1A", "#6B6B6B"],
    typeface: "Inter / Geist",
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Generous whitespace, serif touches, content-first. Feels like Notion or a well-designed publication.",
    reference: "Notion, Linear Docs",
    design_system: "notion",
    palette_preview: ["#2383E2", "#FFFFFF", "#37352F", "#787774"],
    typeface: "Inter / Georgia",
  },
  {
    id: "data-dense-pro",
    name: "Data-Dense Pro",
    description: "Information-rich, tight spacing, built for power users. Feels like PostHog or a Bloomberg terminal.",
    reference: "PostHog, ClickHouse",
    design_system: "posthog",
    palette_preview: ["#1D4AFF", "#1A1A1A", "#FFFFFF", "#888888"],
    typeface: "Inter / JetBrains Mono",
  },
]
