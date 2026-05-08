import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CraftWorkflowState } from "../types.js"

export function registerStartCraft(server: McpServer) {
  server.tool(
    "start_craft",
    "Entry point for /craft. Call this first. Pass design_md if DESIGN.md exists in the project root — this resumes the workflow. Store the returned state and pass it to every continue_craft call.",
    {
      goal: z.string().describe("What the user wants to design, or 'resume'"),
      design_md: z.string().optional().describe("Raw DESIGN.md contents if resuming"),
    },
    async ({ goal, design_md }) => {
      if (design_md) {
        const state = parseDesignMd(design_md, goal)
        const currentBlock = state.block_plan.find(b => b.status === "current" || b.status === "pending")
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
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            state,
            questions: [
              "Who is the primary user — developers, designers, or managers?",
              "What's the overall tone — professional and calm, playful, data-dense, editorial?",
              "Any existing brand constraint — colors, fonts, a reference URL? (or skip)",
            ],
            hint: "Ask these questions using the host input tool (one at a time), then call continue_craft({ state, action: { type: 'answer_project_questions', answers: [...] } })",
          }),
        }],
      }
    }
  )
}

function inferBlockPlan(goal: string) {
  const lower = goal.toLowerCase()
  if (lower.includes("landing page") || lower.includes("marketing")) {
    return [
      { block: "hero-section", status: "current" as const },
      { block: "navigation", status: "pending" as const },
      { block: "pricing-row", status: "pending" as const },
    ]
  }
  return [{ block: "hero-section", status: "current" as const }]
}

function blockQuestions(block: string): string[] {
  const map: Record<string, string[]> = {
    "hero-section": [
      "What's the single action the hero needs to drive?",
      "Is the product established or pre-launch?",
      "One headline idea, or should I propose options based on the brief?",
    ],
    "navigation": [
      "Global navigation to other pages, or in-page anchor links?",
      "Should the nav include a CTA button, or just links?",
    ],
    "pricing-row": [
      "How many tiers? (2–3)",
      "Is there a recommended tier you want highlighted?",
      "Monthly pricing, annual, or both with a toggle?",
    ],
  }
  return map[block] ?? ["Describe what this block needs to do."]
}

function parseDesignMd(content: string, goal: string): CraftWorkflowState {
  // Minimal parser — extracts enough to resume the workflow
  const completedBlocks = [...content.matchAll(/###\s+(.+)\s+✅/g)].map(m => m[1].toLowerCase().replace(/\s+/g, "-"))
  const currentMatch = content.match(/###\s+(.+)\s+🔄/)
  const currentBlock = currentMatch ? currentMatch[1].toLowerCase().replace(/\s+/g, "-") : undefined

  const directionMatch = content.match(/## Direction\n(.+)/m)
  const systemMatch = content.match(/## Design System\n(.+)/m)

  return {
    phase: "block_definition",
    goal,
    block_plan: [],
    current_block: currentBlock,
    direction: directionMatch && systemMatch ? {
      id: directionMatch[1].toLowerCase().replace(/\s.+/, ""),
      name: directionMatch[1].trim(),
      design_system: systemMatch[1].trim().toLowerCase(),
    } : undefined,
    block_definitions: Object.fromEntries(completedBlocks.map(b => [b, {}])),
    design_md: content,
  }
}
