import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CraftWorkflowState, ContinueCraftOutput, Direction } from "../types.js"
import { prepareReadyArtifacts } from "../agent/prepare-ready.js"

const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("answer_project_questions"), answers: z.array(z.string()) }),
  z.object({ type: z.literal("answer_block_questions"), answers: z.array(z.string()) }),
  z.object({ type: z.literal("choose_direction"), direction_id: z.string() }),
  z.object({ type: z.literal("define_more"), details: z.string() }),
  z.object({ type: z.literal("request_design") }),
  z.object({ type: z.literal("approve_block"), block: z.string() }),
  z.object({ type: z.literal("restart_block") }),
])

const StateSchema = z.object({
  phase: z.enum(["project_setup", "block_definition", "direction_choice", "define_or_design", "ready", "block_done", "all_done"]),
  goal: z.string(),
  block_plan: z.array(z.object({ block: z.string(), status: z.enum(["pending", "current", "completed"]) })),
  current_block: z.string().optional(),
  execution: z.object({
    renderer: z.enum(["code", "figma"]).optional(),
    figma_session_id: z.string().optional(),
  }).optional(),
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
  existing_components: z.array(z.string()).optional(),
  component_mappings: z.array(z.object({
    component_name: z.string(),
    source_path: z.string().optional(),
    semantic_component_id: z.string(),
    variants: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    prop_mapping: z.record(z.string()).optional(),
    renderer_hints: z.array(z.string()).optional(),
  })).optional(),
  custom_design_system: z.object({
    tokens: z.any().transform(v => v as import("../types.js").DesignSystemTokens),
    anti_patterns: z.array(z.string()),
  }).optional(),
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
      const output = await advance(state as CraftWorkflowState, action)
      return {
        content: [{ type: "text", text: JSON.stringify(output) }],
      }
    }
  )
}

export async function advance(state: CraftWorkflowState, action: z.infer<typeof ActionSchema>): Promise<ContinueCraftOutput> {
  switch (action.type) {
    case "answer_project_questions": {
      const [audience, tone, brandNotes, screensAnswer] = action.answers

      // If block_plan was empty (custom goal), parse the 4th answer into block slugs
      let blockPlan = state.block_plan
      if (blockPlan.length === 0 && screensAnswer) {
        const slugs = screensAnswer
          .split(/[,\n]+|\band\b/)
          .map(s => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, ""))
          .filter(Boolean)
        blockPlan = slugs.map((block, i) => ({
          block,
          status: (i === 0 ? "current" : "pending") as "current" | "pending",
        }))
      }

      const currentBlock = blockPlan.find(b => b.status === "current")?.block ?? blockPlan[0]?.block ?? "screen"
      const next: CraftWorkflowState = {
        ...state,
        phase: "block_definition",
        current_block: currentBlock,
        block_plan: blockPlan,
        project_context: { audience, tone, brand_notes: brandNotes },
        design_md: appendDesignMd(state.design_md, `## Goal\n${state.goal}\n\n## Project Context\nAudience: ${audience}\nTone: ${tone}${brandNotes ? `\nBrand: ${brandNotes}` : ""}`),
      }
      return {
        state: next,
        hint: [
          `Read any relevant project files (existing components, data models, API types, route files) to understand what "${currentBlock}" needs to handle in the context of "${state.goal}".`,
          `Then ask 2–3 questions specific to this block — not generic. Good questions establish: what data or actions this block shows or collects; the user's primary goal in this view; any edge cases or states (empty, error, loading) that matter here.`,
          `Ask one at a time via chat — one at a time. Propose your recommendation before each. If an answer opens a branch, ask one follow-up.`,
          `When you have enough to define the block, call continue_craft({ state, action: { type: "answer_block_questions", answers: [primary_action_or_purpose, data_or_content_summary, edge_cases_or_notes] } }).`,
        ].join(" "),
      }
    }

    case "answer_block_questions": {
      const block = state.current_block ?? ""
      const [primaryAction, ...rest] = action.answers
      const updatedDefs = { ...state.block_definitions, [block]: { primary_action: primaryAction, notes: rest } }

      if (!state.direction) {
        const directions = getDirections(state)
        const next: CraftWorkflowState = { ...state, phase: "direction_choice", block_definitions: updatedDefs }
        return {
          state: next,
          directions,
          hint: `Present these directions to the user by feel — describe the mood, not the tech stack. Before asking them to choose, state which direction you'd recommend based on the brief and why (one sentence). Then ask: "Does that feel right, or do you want something different?" Once they confirm or redirect, call continue_craft({ state, action: { type: "choose_direction", direction_id: "..." } })`,
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
      const directions = getDirections(state)
      const direction = directions.find(d => d.id === action.direction_id)
      if (!direction) {
        return {
          state: { ...state, phase: "direction_choice" },
          directions,
          hint: `Unknown direction_id "${action.direction_id}". Present the available directions again and call choose_direction with one of their ids.`,
        }
      }
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
        hint: `Ask the follow-up question. Propose your own recommended answer before waiting. If the user's response settles the ambiguity, call continue_craft with request_design. If it opens another branch, ask one more follow-up. Do not loop more than twice — if still unclear, make a reasonable assumption, state it, and proceed with request_design.`,
      }
    }

    case "request_design": {
      const block = state.current_block ?? ""
      if (!state.direction) {
        return {
          state: { ...state, phase: "direction_choice" },
          directions: getDirections(state),
          hint: "Choose a direction before requesting design.",
        }
      }
      const blockDef = state.block_definitions[block] ?? {}

      const prepared = await prepareReadyArtifacts(state)
      const patch = `\n### ${block} 🔄\n- Primary action: ${blockDef.primary_action}\n`
      const next: CraftWorkflowState = { ...state, phase: "ready", design_md: state.design_md + patch }

      return {
        state: next,
        craft_context: prepared.craftContext,
        plugin_spec: prepared.pluginSpec,
        render_intent: prepared.renderIntent,
        render_plan: prepared.renderPlan,
        render_tree: prepared.renderTree,
        critique_findings: prepared.critiqueFindings,
        preflight_findings: prepared.preflightFindings,
        design_md_patch: patch,
        hint: buildExecutionHint(next, prepared.craftContext.mode ?? "structured", prepared.renderIntent.artifact_name),
      }
    }

    case "approve_block": {
      let promoted = false
      const finalPlan = state.block_plan.map(b => {
        if (b.block === action.block) return { ...b, status: "completed" as const }
        if (!promoted && b.status === "pending") {
          promoted = true
          return { ...b, status: "current" as const }
        }
        if (b.status === "current") return { ...b, status: "pending" as const }
        return b
      })

      const nextBlock = finalPlan.find(b => b.status === "current" && b.block !== action.block)
      const allDone = !nextBlock

      // Block sequencing: suggest natural next blocks not already in the plan
      const planned = new Set(finalPlan.map(b => b.block))
      const suggestions = (BLOCK_SEQUENCES[action.block] ?? []).filter(b => !planned.has(b))
      const suggestionText = suggestions.length
        ? ` Consider adding next: ${suggestions.slice(0, 2).join(" or ")}.`
        : ""

      const patch = `\n### ${action.block} ✅\n`
      const designMd = markBlockCompleted(state.design_md, action.block)
      const next: CraftWorkflowState = {
        ...state,
        phase: allDone ? "all_done" : "block_done",
        current_block: nextBlock?.block,
        block_plan: finalPlan,
        design_md: designMd,
      }

      return {
        state: next,
        design_md_patch: patch,
        resume_prompt: allDone
          ? `All blocks complete. Your DESIGN.md has the full design record.${suggestionText}`
          : `${action.block} done. Run /craft to continue with ${nextBlock?.block}.${suggestionText}`,
        hint: allDone
          ? "Inform the user the design is complete. Include the suggestionText if present."
          : `Show the resume_prompt. Write design_md_patch to DESIGN.md. The user will run /craft to continue.`,
      }
    }

    case "restart_block": {
      const directions = getDirections(state)
      const next: CraftWorkflowState = { ...state, phase: "direction_choice", direction: undefined }
      return {
        state: next,
        directions,
        hint: `Present these 3 directions. Project-level decisions from DESIGN.md are preserved. Wait for choice, then call continue_craft with choose_direction.`,
      }
    }
  }
}

function buildExecutionHint(state: CraftWorkflowState, mode: "free" | "structured", artifactName: string): string {
  const base = [
    `Mode is "${mode}" — ${mode === "structured" ? "use auto-layout frames and instance components by node ID if Craft Bridge has run setup" : "use free placement for creative composition"}.`,
    `After execution, call validate_design({ description: "<what you built>", craft_context }).`,
    `Do not show output that fails validation — fix violations first.`,
  ]

  if (state.execution?.renderer === "figma" && state.execution.figma_session_id) {
    return [
      ...base,
      `State your execution intent in one sentence, then render into Figma session "${state.execution.figma_session_id}".`,
      `Do not choose low-level renderer tools yourself. Call execute_craft_ready({ state }) as the canonical execution step.`,
      `execute_craft_ready will recompute the disciplined Craft payload and dispatch the semantic render_tree through the bridge.`,
      `Respect critique_findings and preflight_findings before execution. They are lint from Craft itself, not optional commentary.`,
      `Only use figma_get_context, figma_render_tree, or figma_prepare_plan when you are explicitly debugging the execution path.`,
      `render_tree is already semantically resolved. Preserve its semantic components and resolution targets instead of collapsing back to anonymous primitives.`,
      `Render a final-looking design, not a wireframe. Use real fills, spacing, hierarchy, surfaces, and interaction affordances from the selected design system tokens.`,
      `Use render_intent.artifact_name "${artifactName}" as the stable name for the rendered artifact and its sibling local asset section.`,
      `Do not use scaffold_block or placeholder slots unless the user explicitly asks for a scaffold.`,
      `Do not generate React, HTML, or CSS when the renderer is Figma — the plugin is the execution surface.`,
      `execute_craft_ready is the primary Craft execution contract. render_tree is the primary Figma payload under that contract. figma_render_block, figma_execute_op, and figma_prepare_plan are fallback or debugging paths, not normal design rendering.`,
    ].join(" ")
  }

  return [
    ...base,
    `State your execution intent in one sentence, then execute using the available execution tool.`,
    `plugin_spec is provided for the Craft Bridge Figma plugin if the user prefers to render via plugin instead of agent.`,
  ].join(" ")
}

function appendDesignMd(existing: string, addition: string): string {
  return existing ? `${existing}\n\n${addition}` : `# Project Design Context\n\n${addition}`
}

function markBlockCompleted(designMd: string, block: string): string {
  const inProgressHeading = new RegExp(`(^|\\n)### ${escapeRegExp(block)} 🔄\\n- Primary action:.*?(?=\\n### |$)`, "s")
  if (inProgressHeading.test(designMd)) {
    return designMd.replace(inProgressHeading, `$1### ${block} ✅\n`)
  }
  return designMd + `\n### ${block} ✅\n`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
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

// Ranks the 3 built-in directions based on brief signals. Prepends custom direction if present.
export function getDirections(state: CraftWorkflowState): Direction[] {
  const tone = (state.project_context?.tone ?? "").toLowerCase()
  const platform = state.project_context?.platform
  const block = state.current_block ?? ""

  const scores: Record<string, number> = { "focused-calm": 0, "warm-editorial": 0, "data-dense-pro": 0 }

  // Tone signals
  if (/calm|clean|minimal|simple|professional|sharp|precise/.test(tone)) scores["focused-calm"] += 2
  if (/warm|editorial|content|blog|document|readable|human/.test(tone)) scores["warm-editorial"] += 2
  if (/data|dense|technical|analytics|dashboard|power/.test(tone)) scores["data-dense-pro"] += 2

  // Block type signals
  if (["data-table", "kpi-summary"].includes(block)) scores["data-dense-pro"] += 3
  if (["card-grid", "footer"].includes(block)) scores["warm-editorial"] += 1
  if (["sidebar", "navigation"].includes(block)) scores["focused-calm"] += 1

  // Platform signals — mobile rarely benefits from data-dense-pro first
  if (platform === "mobile") scores["data-dense-pro"] -= 2

  const ranked = [...DIRECTIONS].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))

  // Prepend the custom direction if craft-ds.md was loaded
  if (state.custom_design_system) {
    const customDirection: Direction = {
      id: "custom",
      name: "Your Brand",
      description: "Uses your project's own design tokens from craft-ds.md. Stays true to your existing visual language.",
      reference: "craft-ds.md",
      design_system: "custom",
      palette_preview: [],
      typeface: "From your brand tokens",
    }
    return [customDirection, ...ranked]
  }

  return ranked
}

// Natural next-block suggestions per block type. Used for block sequencing after approval.
const BLOCK_SEQUENCES: Record<string, string[]> = {
  "hero-section":          ["navigation", "feature-highlights", "pricing-row"],
  "navigation":            ["hero-section", "feature-highlights", "footer"],
  "feature-highlights":    ["pricing-row", "card-grid", "footer"],
  "pricing-row":           ["footer", "feature-highlights"],
  "footer":                [],
  "data-table":            ["kpi-summary", "sidebar", "empty-state"],
  "kpi-summary":           ["data-table", "card-grid"],
  "form":                  ["onboarding-step", "empty-state"],
  "modal":                 [],
  "sidebar":               ["navigation", "data-table"],
  "card-grid":             ["footer", "feature-highlights"],
  "onboarding-step":       ["form", "empty-state"],
  "empty-state":           [],
  "mobile-screen-header":  ["bottom-navigation"],
  "bottom-navigation":     ["mobile-screen-header"],
}

const DIRECTIONS: Direction[] = [
  {
    id: "focused-calm",
    name: "Focused & Calm",
    description: "Clean, restrained, lots of breathing room. Every element earns its place. Feels like Linear or Vercel.",
    reference: "Linear, Vercel, Stripe",
    design_system: "linear",
    palette_preview: ["#5E6AD2", "#F7F7F5", "#1A1A1A", "#6B6B6B"],
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
    description: "Information-rich, tight spacing, built for power users. Feels like PostHog or a ClickHouse dashboard.",
    reference: "PostHog, ClickHouse",
    design_system: "posthog",
    palette_preview: ["#F54E00", "#151515", "#EEEEEE", "#999999"],
    typeface: "Inter / JetBrains Mono",
  },
]
