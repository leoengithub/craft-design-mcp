import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export function registerValidateDesign(server: McpServer) {
  server.tool(
    "validate_design",
    "Constraint checklist against a plain-language description of what you built. Call after execution, before showing the user. Checks the description against skill anti-patterns and required elements — it does not inspect Figma frames, code, or screenshots. The user is still the final quality gate.",
    {
      description: z.string().describe("Plain-language description of what you built"),
      craft_context: z.object({
        block: z.string(),
        brief: z.object({
          primary_action: z.string(),
          audience: z.string().optional(),
          tone: z.string().optional(),
          notes: z.array(z.string()).optional(),
        }),
        constraints: z.object({
          layout_rules: z.array(z.string()),
          component_patterns: z.array(z.string()),
          anti_patterns: z.array(z.string()),
        }),
      }).passthrough(),
    },
    async ({ description, craft_context }) => {
      const failures: Array<{ dimension: string; reason: string; followup_question: string }> = []
      const desc = description.toLowerCase()

      // Check anti-patterns
      for (const pattern of craft_context.constraints.anti_patterns) {
        const signal = extractSignal(pattern)
        if (signal && desc.includes(signal)) {
          failures.push({
            dimension: "restraint",
            reason: `Possible anti-pattern detected: "${pattern}"`,
            followup_question: `Your description may include a known anti-pattern: "${pattern}". Is this intentional?`,
          })
        }
      }

      // Block-specific P0 checks
      if (craft_context.block === "hero-section") {
        if (!desc.includes("cta") && !desc.includes("button")) {
          failures.push({
            dimension: "completeness",
            reason: "No CTA button found in description",
            followup_question: "The hero requires exactly one CTA button — was it omitted?",
          })
        }
        if (/(two|2|secondary|second)\s*(cta|button)/.test(desc)) {
          failures.push({
            dimension: "restraint",
            reason: "Description mentions multiple CTA buttons",
            followup_question: "The hero must have exactly one CTA — which one should remain?",
          })
        }
      }

      const scores = {
        philosophy: failures.some(f => f.dimension === "philosophy") ? 2 : 5,
        hierarchy: failures.some(f => f.dimension === "hierarchy") ? 2 : 5,
        specificity: failures.some(f => f.dimension === "specificity") ? 2 : 5,
        restraint: failures.some(f => f.dimension === "restraint") ? 2 : 5,
        completeness: failures.some(f => f.dimension === "completeness") ? 2 : 5,
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ passed: failures.length === 0, scores, failures }),
        }],
      }
    }
  )
}

function extractSignal(antiPattern: string): string | null {
  // Extract the key noun/phrase from an anti-pattern rule for fuzzy matching
  const lower = antiPattern.toLowerCase()
  if (lower.includes("carousel")) return "carousel"
  if (lower.includes("stock photo")) return "stock photo"
  if (lower.includes("gradient")) return "gradient"
  if (lower.includes("hamburger")) return "hamburger"
  return null
}
