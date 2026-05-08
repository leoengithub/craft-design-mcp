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
    },
    async ({ goal, design_md, components_md, craft_ds_md }) => {
      const existingComponents = components_md ? parseComponentsMd(components_md) : undefined
      const customSystem = craft_ds_md ? await parseCraftDsMd(craft_ds_md) : undefined

      if (design_md) {
        const state = parseDesignMd(design_md, goal, existingComponents, customSystem)
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
              questions: blockQuestions(currentBlock?.block ?? ""),
              hint: `Resuming. Ask these questions for the ${currentBlock?.block} block using the host input tool (one at a time), then call continue_craft({ state, action: { type: "answer_block_questions", answers: [...] } })`,
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
        existing_components: existingComponents,
        custom_design_system: customSystem,
      }

      const brandNote = customSystem ? " Your craft-ds.md was found and loaded as a custom direction option." : ""
      const componentsNote = existingComponents?.length ? ` ${existingComponents.length} existing components found in COMPONENTS.md — the agent will reuse them.` : ""
      const hasKnownBlocks = state.block_plan.length > 0

      const questions = [
        "Who is the primary user — developers, designers, or managers?",
        "What's the overall tone — professional and calm, playful, data-dense, editorial?",
        "Any existing brand constraint — colors, fonts, a reference URL? (or skip)",
        ...(!hasKnownBlocks ? ["What are the main screens or components you need to design? (list them, e.g. 'user list, rule editor, settings page')"] : []),
      ]

      const blocksNote = !hasKnownBlocks
        ? ` The goal didn't match a known block pattern — the 4th question establishes the block plan. Include all 4 answers when calling answer_project_questions: [audience, tone, brand, screens].`
        : ""

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            state,
            questions,
            hint: `These are seed questions to establish project context. Ask them one at a time using the host input tool. For each, propose your own recommended answer before waiting — e.g. "Who is the primary user? (I'd assume developers based on the goal — confirm or redirect)". If any question can be answered by reading project files (package.json, README, existing code), read them instead of asking. Once context is established, call continue_craft({ state, action: { type: 'answer_project_questions', answers: [...] } }) with a concise summary of what was established.${brandNote}${componentsNote}${blocksNote}`,
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

function blockQuestions(block: string): string[] {
  const map: Record<string, string[]> = {
    "hero-section":         ["What's the single action the hero needs to drive?", "Is the product established or pre-launch?", "One headline idea, or should I propose options?"],
    "navigation":           ["Global navigation to pages, or in-page anchor links?", "Should the nav include a CTA button, or just links?"],
    "pricing-row":          ["How many tiers? (2–3 recommended)", "Which tier should be highlighted as recommended?", "Monthly pricing, annual, or both with a toggle?"],
    "feature-highlights":   ["How many features to highlight? (3–6)", "What's the primary benefit theme — speed, collaboration, reliability?"],
    "footer":               ["Which link groups does the footer need? (e.g. Product, Company, Legal)", "Should the footer include social icons or a newsletter field?"],
    "data-table":           ["What are the column names?", "Does the table need sorting, filtering, or row selection?"],
    "kpi-summary":          ["Which metrics to show? (3–6)", "Should each metric show a delta vs last period?"],
    "onboarding-step":      ["Which step number is this, and what is the total?", "Is this an input form or an option-card choice?"],
    "form":                 ["What fields does this form need?", "What is the submit action? (e.g. 'Create account', 'Save settings')"],
    "card-grid":            ["What type of items are in the cards? (blog posts, team members, case studies...)", "How many columns? (2–4)"],
    "modal":                ["What action or content does this modal contain?", "What is the primary button label?"],
    "sidebar":              ["What are the top-level navigation sections?", "Does the sidebar need a nested section?"],
    "empty-state":          ["What context is empty? (empty inbox, no projects, no results...)", "What is the primary CTA to fill this space?"],
    "mobile-screen-header": ["What is the screen title?", "Does the header need action icons on the right — if so, which ones?"],
    "bottom-navigation":    ["What are the 3–5 tab destinations?", "Which tab is the default active state?"],
  }
  return map[block] ?? ["Describe what this block needs to do."]
}

export function parseDesignMd(
  content: string,
  goal: string,
  existingComponents?: string[],
  customSystem?: CraftWorkflowState["custom_design_system"],
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
