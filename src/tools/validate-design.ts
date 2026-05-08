import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { loadSkill } from "../skills/loader.js"

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

      // Load skill to get the parsed checklist (P0 checks live there)
      let checklist: Awaited<ReturnType<typeof loadSkill>>["checklist"] = []
      try {
        const skill = await loadSkill(craft_context.block)
        checklist = skill.checklist
      } catch {
        // Skill file not found — fall through to anti-pattern checks only
      }

      // P0 checks — hard fails regardless of dimension score
      for (const item of checklist.filter(c => c.is_p0)) {
        const failure = checkP0Rule(item.text, desc)
        if (failure) {
          failures.push({
            dimension: "P0",
            reason: failure,
            followup_question: `P0 check failed: "${item.text}". Please verify before showing output.`,
          })
        }
      }

      // Anti-pattern checks — fuzzy signal matching
      for (const pattern of craft_context.constraints.anti_patterns) {
        const signals = extractSignals(pattern)
        for (const signal of signals) {
          if (desc.includes(signal)) {
            failures.push({
              dimension: "restraint",
              reason: `Possible anti-pattern: "${pattern}"`,
              followup_question: `Your description mentions "${signal}", which is a known anti-pattern. Is this intentional?`,
            })
            break
          }
        }
      }

      // Dimension scores — 5 if no failure in that dimension, 2 if any
      const dimensionFailures = new Set(failures.map(f => f.dimension.toLowerCase()))
      const scores = {
        philosophy:   dimensionFailures.has("philosophy") ? 2 : 5,
        hierarchy:    dimensionFailures.has("hierarchy")  ? 2 : 5,
        specificity:  dimensionFailures.has("specificity") ? 2 : 5,
        restraint:    dimensionFailures.has("restraint")  ? 2 : 5,
        completeness: dimensionFailures.has("completeness") ? 2 : 5,
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

// Extracts key noun/phrase signals from an anti-pattern rule for fuzzy description matching.
function extractSignals(rule: string): string[] {
  const lower = rule.toLowerCase()
  const signals: string[] = []

  // Pull quoted phrases first — they're the most specific signals
  for (const m of lower.matchAll(/"([^"]+)"/g)) signals.push(m[1])

  // Known keyword signals shared across block types
  const keywords = [
    "carousel", "gradient", "stock photo", "hamburger", "placeholder",
    "hand-drawn", "mega menu", "drop shadow", "animation", "illustration",
    "two cta", "secondary button", "get started", "all-in-one",
    "revolutionizing", "the future of",
  ]
  for (const kw of keywords) {
    if (lower.includes(kw)) signals.push(kw)
  }

  return signals
}

// Checks a P0 rule text against the description. Returns a failure reason string or null.
function checkP0Rule(ruleText: string, desc: string): string | null {
  const rule = ruleText.toLowerCase()
  const max = extractMaximum(rule)

  if (rule.includes("one cta") || rule.includes("one button")) {
    if (!desc.includes("cta") && !desc.includes("button")) {
      return "No CTA button described — P0 requires exactly one"
    }
    if (/(two|2|secondary|second)\s*(cta|button)/.test(desc)) {
      return "Multiple CTAs described — P0 requires exactly one"
    }
  }

  if (rule.includes("no stock photo") || rule.includes("no stock photography")) {
    if (desc.includes("stock photo")) return "Stock photography mentioned — P0 prohibits it"
  }

  if (rule.includes("no gradient")) {
    if (desc.includes("gradient")) return "Gradient mentioned — P0 prohibits it"
  }

  if (rule.includes("no placeholder")) {
    if (desc.includes("placeholder")) return "Placeholder content mentioned — P0 prohibits it"
  }

  if (rule.includes("no hamburger")) {
    if (desc.includes("hamburger")) return "Hamburger menu mentioned — P0 prohibits it on desktop"
  }

  if (rule.includes("maximum") && rule.includes("tier")) {
    const match = desc.match(/(\d+)\s*tier/)
    if (match && parseInt(match[1]) > 3) return `${match[1]} tiers described — P0 allows maximum 3`
  }

  if (rule.includes("visible text label")) {
    if (/icon-only|icons only|no labels|without labels|label-less/.test(desc)) {
      return "Icon-only items described — P0 requires visible text labels"
    }
  }

  if (rule.includes("tabs only") || (rule.includes("tabs") && rule.includes("never fewer"))) {
    const tabs = extractCount(desc, "tabs?")
    if (tabs !== null && (tabs < 3 || tabs > 5)) {
      return `${tabs} tabs described — P0 requires 3-5 tabs`
    }
  }

  if (rule.includes("same structure") || rule.includes("share the same structure")) {
    if (/mixed layouts?|different structures?|varied structures?|uneven card/.test(desc)) {
      return "Mixed card structures described — P0 requires one shared structure"
    }
  }

  if (max !== null && rule.includes("columns")) {
    const columns = extractCount(desc, "columns?")
    if (columns !== null && columns > max) {
      return `${columns} columns described — P0 allows maximum ${max}`
    }
  }

  if (rule.includes("empty state is required")) {
    if (/blank table|no empty state|without an empty state/.test(desc) || !desc.includes("empty state")) {
      return "No empty state described — P0 requires one"
    }
  }

  if (rule.includes("actionable cta")) {
    if (!desc.includes("cta") && !desc.includes("button") && !desc.includes("action")) {
      return "No actionable CTA described — P0 requires one"
    }
    if (/dead end|no action|without action|non-actionable/.test(desc)) {
      return "Dead-end empty state described — P0 requires an actionable CTA"
    }
  }

  if (rule.includes("headline must describe")) {
    if (/nothing here|generic headline|placeholder headline/.test(desc)) {
      return "Generic empty-state headline described — P0 requires contextual copy"
    }
  }

  if (rule.includes("no invented metrics") || rule.includes("no invented numbers")) {
    if (/invented|made-up|fake|placeholder metric|placeholder number/.test(desc)) {
      return "Invented or placeholder metrics described — P0 prohibits them unless explicitly marked"
    }
  }

  if (rule.includes("reference period")) {
    if (/delta|change|increase|decrease|up|down|%/.test(desc) && !/vs |versus|compared to|last week|last month|previous/.test(desc)) {
      return "Delta described without a reference period"
    }
  }

  if (rule.includes("marketing copy") || rule.includes("cta buttons")) {
    if (/marketing copy|sales copy|cta button|primary cta/.test(desc)) {
      return "Footer marketing copy or CTA described — P0 says footer is utility only"
    }
  }

  if (rule.includes("duplicate of primary navigation")) {
    if (/duplicate|same as primary nav|repeats primary navigation/.test(desc)) {
      return "Footer duplicates primary navigation links"
    }
  }

  if (rule.includes("placeholder-only labels")) {
    if (/placeholder-only|placeholder only|labels? omitted|without labels?/.test(desc)) {
      return "Placeholder-only field labels described — P0 requires visible labels"
    }
  }

  if (rule.includes("specific action label")) {
    if (/"submit"|"ok"|labelled submit|labeled submit|labelled ok|labeled ok/.test(desc)) {
      return "Generic submit label described — P0 requires a specific action label"
    }
  }

  if (max !== null && (rule.includes("action icons") || rule.includes("input fields") || rule.includes("nesting levels"))) {
    const noun = rule.includes("action icons") ? "action icons?" : rule.includes("input fields") ? "input fields?" : "nesting levels?"
    const count = extractCount(desc, noun)
    if (count !== null && count > max) {
      return `${count} ${noun.replace("?", "")} described — P0 allows maximum ${max}`
    }
  }

  if (rule.includes("title must fit on one line")) {
    if (/two-line title|multiline title|subtitle|truncated title|title truncates/.test(desc)) {
      return "Header title does not fit on one line"
    }
  }

  if (rule.includes("progress indicator")) {
    if (!/progress|step \d+|step indicator|stepper/.test(desc)) {
      return "No progress indicator described"
    }
  }

  if (rule.includes("dismiss mechanism")) {
    if (!/dismiss|close|x button|cancel/.test(desc)) {
      return "No dismiss mechanism described"
    }
  }

  return null
}

function extractMaximum(rule: string): number | null {
  const match = rule.match(/maximum\s+(\d+)/)
  return match ? parseInt(match[1]) : null
}

function extractCount(desc: string, nounPattern: string): number | null {
  const numeric = desc.match(new RegExp(`(\\d+)\\s+${nounPattern}`))
  if (numeric) return parseInt(numeric[1])

  const words: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  }
  const word = desc.match(new RegExp(`\\b(${Object.keys(words).join("|")})\\s+${nounPattern}`))
  return word ? words[word[1]] : null
}
