import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CraftWorkflowState } from "../types.js"

export function registerStartCraft(server: McpServer) {
  server.tool(
    "start_craft",
    [
      "Entry point for /craft. Call this first.",
      "- Pass design_md if DESIGN.md exists in the project root — resumes the workflow.",
      "- Pass components_md if COMPONENTS.md exists — agent will avoid rebuilding listed components.",
      "- Pass craft_ds_md if craft-ds.md exists — uses the project's own brand tokens as a custom direction.",
      "Store the returned state and pass it to every continue_craft call.",
    ].join("\n"),
    {
      goal:         z.string().describe("What the user wants to design, or 'resume'"),
      design_md:    z.string().optional().describe("Raw DESIGN.md contents if resuming"),
      components_md: z.string().optional().describe("Raw COMPONENTS.md contents if present in project root"),
      craft_ds_md:  z.string().optional().describe("Raw craft-ds.md contents if present in project root"),
      renderer:     z.enum(["code", "figma"]).optional().describe("Preferred execution renderer"),
      figma_session_id: z.string().optional().describe("Craft Bridge Figma session ID when rendering into Figma"),
    },
    async ({ goal, design_md, components_md, craft_ds_md, renderer, figma_session_id }) => {
      const existingComponents = components_md ? parseComponentsMd(components_md) : undefined
      const customSystem = craft_ds_md ? await parseCraftDsMd(craft_ds_md) : undefined

      if (design_md) {
        const state = parseDesignMd(design_md, goal, existingComponents, customSystem, renderer, figma_session_id)
        const currentBlock = state.block_plan.find(b => b.status === "current" || b.status === "pending")
        if (!currentBlock) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                state,
                resume_prompt: "All blocks complete. Your DESIGN.md has the full design record.",
                hint: "Inform the user the design is complete.",
              }),
            }],
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              state,
              hint: [
                `Resuming. Read any relevant project files to understand what "${currentBlock?.block}" needs in the context of "${goal}".`,
                `Ask 2–3 focused questions specific to this block — what data or actions it handles, the user's primary goal here, any edge cases.`,
                `Ask one at a time via chat — one at a time, propose your recommendation first.`,
                `Then call continue_craft({ state, action: { type: "answer_block_questions", answers: [...] } }).`,
              ].join(" "),
            }),
          }],
        }
      }

      const state: CraftWorkflowState = {
        phase: "project_setup",
        goal,
        block_plan: inferBlockPlan(goal),
        block_definitions: {},
        design_md: "",
        execution: renderer ? { renderer, figma_session_id } : undefined,
        existing_components: existingComponents,
        custom_design_system: customSystem,
      }

      const brandNote = customSystem ? " craft-ds.md was loaded — 'Your Brand' will appear as a direction option." : ""
      const componentsNote = existingComponents?.length ? ` ${existingComponents.length} existing components found in COMPONENTS.md — reuse them instead of rebuilding.` : ""
      const figmaNote = renderer === "figma" && figma_session_id
        ? ` Figma renderer is locked to session "${figma_session_id}" — use figma_get_context before execution, and render via figma_prepare_plan/figma_wait_for_result instead of generating code.`
        : ""
      const hasKnownBlocks = state.block_plan.length > 0
      const screensInstruction = !hasKnownBlocks
        ? ` Also determine the main screens or components to design (e.g. "rule editor, user list, empty state") and include them as the last answer — they will become the block plan.`
        : ""

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            state,
            hint: [
              `Read project files first (package.json, README, existing code, tailwind.config, src/) to understand the tech stack and constraints — answer any questions you can from those instead of asking.`,
              `Then ask 2–3 focused questions specific to designing: "${goal}".`,
              `Good questions for this phase establish: who uses this and what's their job-to-be-done in this flow; what a successful interaction looks like (primary action / outcome); any hard constraints from the existing system or data model.`,
              `Do NOT ask generic questions like "who is the audience" or "what's the tone" — derive those from the goal and codebase. Only ask what you genuinely can't infer.`,
              `Ask one at a time via chat — one at a time. Propose your own recommendation before waiting.`,
              `Once context is established, call continue_craft({ state, action: { type: 'answer_project_questions', answers: [context_summary, primary_success_criteria, constraints_or_tone${!hasKnownBlocks ? ", screens_list" : ""}] } }).${screensInstruction}${brandNote}${componentsNote}${figmaNote}`,
            ].join(" "),
          }),
        }],
      }
    }
  )
}

// Maps goal keywords to an ordered block sequence. Only references skills with SKILL.md files.
const BLOCK_PATTERNS: Array<[RegExp, string[]]> = [
  [/landing page|marketing site|homepage|saas site/,     ["hero-section", "navigation", "feature-highlights", "pricing-row", "footer"]],
  [/dashboard|analytics|admin panel/,                    ["kpi-summary", "data-table", "sidebar"]],
  [/onboard|signup flow|registration/,                   ["onboarding-step", "form", "empty-state"]],
  [/pricing|plans|tiers|subscription/,                   ["pricing-row"]],
  [/navigation|nav bar|header/,                          ["navigation"]],
  [/hero|above.the.fold|top section/,                    ["hero-section"]],
  [/mobile app|ios|android/,                             ["mobile-screen-header", "bottom-navigation"]],
]

export function inferBlockPlan(goal: string) {
  const lower = goal.toLowerCase()
  for (const [pattern, blocks] of BLOCK_PATTERNS) {
    if (pattern.test(lower)) {
      return blocks.map((block, i) => ({
        block,
        status: (i === 0 ? "current" : "pending") as "current" | "pending",
      }))
    }
  }
  return []
}


export function parseDesignMd(
  content: string,
  goal: string,
  existingComponents?: string[],
  customSystem?: CraftWorkflowState["custom_design_system"],
  renderer?: "code" | "figma",
  figma_session_id?: string,
): CraftWorkflowState {
  const parsedGoal = parseGoal(content) ?? (goal === "resume" ? "resume" : goal)
  const headingEvents = [...content.matchAll(/###\s+(.+?)\s+(✅|🔄)/g)].map(m => ({
    block: normalizeBlockName(m[1]),
    status: m[2] === "✅" ? "completed" as const : "current" as const,
    index: m.index ?? 0,
  }))

  const completed = new Set(headingEvents.filter(e => e.status === "completed").map(e => e.block))
  const activeCurrent = [...headingEvents]
    .reverse()
    .find(e => e.status === "current" && !completed.has(e.block))
    ?.block

  const inferredBlocks = inferBlockPlan(parsedGoal).map(b => b.block)
  const knownBlocks = unique([
    ...inferredBlocks,
    ...headingEvents.map(e => e.block),
  ])

  const currentBlock = activeCurrent ?? knownBlocks.find(block => !completed.has(block))
  const blockPlan = knownBlocks.map(block => ({
    block,
    status: completed.has(block)
      ? "completed" as const
      : block === currentBlock
        ? "current" as const
        : "pending" as const,
  }))

  const directionMatch = content.match(/## Direction\n(.+)/m)
  const systemMatch = content.match(/## Design System\n(.+)/m)
  const directionName = directionMatch?.[1].trim()
  const systemName = systemMatch?.[1].trim().toLowerCase()
  const phase = currentBlock ? "block_definition" : "all_done"

  return {
    phase,
    goal: parsedGoal,
    block_plan: blockPlan,
    current_block: currentBlock,
    execution: renderer ? { renderer, figma_session_id } : undefined,
    direction: directionName && systemName ? {
      id: directionIdFromName(directionName, systemName),
      name: directionName,
      design_system: systemName,
    } : undefined,
    block_definitions: Object.fromEntries(headingEvents.map(e => [e.block, {}])),
    design_md: content,
    existing_components: existingComponents,
    custom_design_system: customSystem,
  }
}

// Parses COMPONENTS.md — extracts component names from list items.
function parseComponentsMd(content: string): string[] {
  return content
    .split("\n")
    .filter(l => l.startsWith("- "))
    .map(l => l.slice(2).split(/\s*[—–-]\s*/)[0].trim())
    .filter(Boolean)
}

function parseGoal(content: string): string | undefined {
  return content.match(/## Goal\n(.+)/m)?.[1].trim()
}

function normalizeBlockName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-")
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function directionIdFromName(directionName: string, systemName: string): string {
  if (systemName === "custom") return "custom"
  const normalized = directionName.toLowerCase()
  if (normalized.includes("focused")) return "focused-calm"
  if (normalized.includes("warm")) return "warm-editorial"
  if (normalized.includes("data")) return "data-dense-pro"
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

// Parses craft-ds.md using the same parser as built-in design systems.
async function parseCraftDsMd(content: string): Promise<CraftWorkflowState["custom_design_system"]> {
  try {
    const { parseCustomDesignSystem } = await import("../design-systems/loader.js")
    return parseCustomDesignSystem(content)
  } catch {
    return undefined
  }
}
