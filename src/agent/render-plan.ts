import type { CraftContext, CraftWorkflowState, RenderBlockPlan } from "../types.js"

export function buildRenderBlockPlan(state: CraftWorkflowState, craftContext: CraftContext): RenderBlockPlan {
  const block = craftContext.block
  const layout = classifyLayout(state.goal, block)
  const artifactName = humanize(block)
  const primaryAction = craftContext.brief.primary_action || defaultCtaForLayout(layout)
  const title = buildTitle(state.goal, layout, artifactName)
  const body = buildBody(state, craftContext, layout)

  return {
    artifact_name: artifactName,
    asset_section_name: `Craft / Assets / ${artifactName}`,
    block,
    goal: state.goal,
    platform: state.project_context?.platform ?? "web",
    mode: craftContext.mode ?? "structured",
    layout,
    direction: craftContext.direction,
    tokens: craftContext.tokens,
    style: {
      primary: craftContext.tokens.colors.primary ?? "#5E6AD2",
      bg: craftContext.tokens.colors.bg ?? "#FFFFFF",
      surface: craftContext.tokens.colors.surface ?? "#FFFFFF",
      text: craftContext.tokens.colors.text ?? "#1A1A1A",
      muted: craftContext.tokens.colors.muted ?? "#6B7280",
      border: craftContext.tokens.colors.border ?? "#E5E7EB",
      accent: craftContext.tokens.colors.accent,
    },
    content: buildContent(layout, title, body, primaryAction, state, craftContext),
  }
}

function classifyLayout(goal: string, block: string): RenderBlockPlan["layout"] {
  const haystack = `${goal} ${block}`.toLowerCase()
  if (/(feedback bar|feedback-bar|banner|alert|toast|notification bar)/.test(haystack)) return "feedback-bar"
  if (/(accordion)/.test(haystack)) return "accordion"
  if (/(toolbar)/.test(haystack)) return "toolbar"
  if (/(hero|landing|homepage)/.test(haystack)) return "hero"
  if (/(navigation|nav|header)/.test(haystack)) return "navigation"
  if (/(pricing|plans|tiers)/.test(haystack)) return "pricing"
  if (/(feature|highlight|card-grid)/.test(haystack)) return "feature-grid"
  if (/(kpi|metric|summary)/.test(haystack)) return "kpi-summary"
  if (/(table|grid)/.test(haystack)) return "data-table"
  if (/(sidebar)/.test(haystack)) return "sidebar"
  if (/(form|onboarding|auth|login|signup)/.test(haystack)) return "form"
  if (/(empty-state|empty state)/.test(haystack)) return "empty-state"
  if (/(footer)/.test(haystack)) return "footer"
  return "generic"
}

function buildContent(
  layout: RenderBlockPlan["layout"],
  title: string,
  body: string,
  primaryAction: string,
  state: CraftWorkflowState,
  craftContext: CraftContext,
): RenderBlockPlan["content"] {
  const notes = craftContext.brief.notes ?? []
  const noteItems = notes
    .map((note) => note.trim())
    .filter(Boolean)
    .slice(0, 4)

  switch (layout) {
    case "hero":
      return {
        eyebrow: craftContext.direction.name,
        title,
        body,
        cta_label: primaryAction,
        secondary_cta_label: "See details",
        items: noteItems.slice(0, 3).map((note, index) => ({
          title: `Benefit ${index + 1}`,
          body: note,
        })),
      }
    case "navigation":
      return {
        title,
        cta_label: primaryAction,
        links: deriveLinks(state.goal, noteItems),
      }
    case "feedback-bar":
      return {
        title: buildFeedbackTitle(state.goal),
        body,
        cta_label: primaryAction !== "Dismiss" ? primaryAction : undefined,
        secondary_cta_label: "Dismiss",
      }
    case "pricing":
      return {
        title,
        body,
        columns: [
          { title: "Starter", price: "$0", body: "For trying the workflow", cta_label: primaryAction, bullets: deriveBullets(noteItems, 3) },
          { title: "Pro", price: "$29", body: "For daily use", cta_label: primaryAction, featured: true, bullets: deriveBullets(noteItems, 3) },
          { title: "Scale", price: "$99", body: "For team rollout", cta_label: "Talk to sales", bullets: deriveBullets(noteItems, 3) },
        ],
      }
    case "feature-grid":
      return {
        title,
        body,
        items: deriveItems(noteItems, 6, "Capability"),
      }
    case "kpi-summary":
      return {
        title,
        stats: deriveStats(noteItems),
      }
    case "data-table":
      return {
        title,
        body,
        items: deriveItems(noteItems, 5, "Column"),
      }
    case "sidebar":
      return {
        title,
        links: deriveLinks(state.goal, noteItems, ["Overview", "Activity", "Settings", "Support"]),
      }
    case "form":
      return {
        title,
        body,
        cta_label: primaryAction,
        items: deriveItems(noteItems, 4, "Field"),
      }
    case "empty-state":
      return {
        title,
        body,
        cta_label: primaryAction,
      }
    case "footer":
      return {
        title,
        links: deriveLinks(state.goal, noteItems, ["Docs", "Security", "Pricing", "Support"]),
      }
    case "toolbar":
      return {
        title,
        items: deriveToolbarItems(noteItems),
      }
    case "accordion":
      return {
        title,
        body,
        items: deriveItems(noteItems, 4, "Section"),
        cta_label: primaryAction,
      }
    case "generic":
    default:
      return {
        title,
        body,
        cta_label: primaryAction,
        items: deriveItems(noteItems, 3, "Item"),
      }
  }
}

function buildTitle(goal: string, layout: RenderBlockPlan["layout"], artifactName: string): string {
  const cleaned = goal
    .replace(/^(create|build|design)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()

  switch (layout) {
    case "hero":
      return toHeadline(cleaned)
    case "accordion":
      return artifactName
    case "toolbar":
      return "Focused controls"
    default:
      return artifactName
  }
}

function buildBody(state: CraftWorkflowState, craftContext: CraftContext, layout: RenderBlockPlan["layout"]): string {
  const audience = craftContext.brief.audience ? `For ${craftContext.brief.audience}. ` : ""
  const notes = (craftContext.brief.notes ?? []).find(Boolean)
  if (notes) return `${audience}${notes}`
  if (layout === "hero") return `${audience}A calm, high-clarity entry point for ${state.goal.toLowerCase()}.`
  return `${audience}Built with the ${craftContext.direction.name} direction and the project's Craft tokens.`
}

function deriveItems(notes: string[], count: number, label: string): Array<{ title: string; body?: string; meta?: string }> {
  const source = notes.length ? notes : Array.from({ length: count }, (_, i) => `${label} detail ${i + 1}`)
  return source.slice(0, count).map((note, index) => ({
    title: `${label} ${index + 1}`,
    body: note,
    meta: index === 0 ? "Primary" : undefined,
  }))
}

function deriveStats(notes: string[]): Array<{ label: string; value: string; delta?: string }> {
  const labels = notes.length ? notes.slice(0, 4) : ["Adoption", "Speed", "Coverage", "Quality"]
  return labels.map((label, index) => ({
    label: shorten(label, 18),
    value: ["82%", "2.1x", "14", "99%"][index] ?? `${index + 1}`,
    delta: ["+6%", "+18%", "+3", "+1%"][index],
  }))
}

function deriveToolbarItems(notes: string[]): Array<{ title: string; badge?: string }> {
  const defaults = ["Filter", "Sort", "Layout", "Inspect", "Share"]
  const source = notes.length ? notes : defaults
  return source.slice(0, 5).map((label, index) => ({
    title: shorten(label, 14),
    badge: index === 0 ? "Active" : undefined,
  }))
}

function deriveLinks(goal: string, notes: string[], fallback?: string[]): string[] {
  if (notes.length) return notes.slice(0, 4).map((note) => shorten(note, 18))
  if (fallback) return fallback
  if (/dashboard|admin|analytics/i.test(goal)) return ["Overview", "Reports", "Settings", "Support"]
  return ["Product", "Solutions", "Resources", "Pricing"]
}

function deriveBullets(notes: string[], count: number): string[] {
  const source = notes.length ? notes : ["Fast setup", "Consistent tokens", "Reusable patterns", "Clear validation"]
  return source.slice(0, count).map((note) => shorten(note, 32))
}

function defaultCtaForLayout(layout: RenderBlockPlan["layout"]): string {
  switch (layout) {
    case "pricing":
      return "Start free"
    case "form":
      return "Continue"
    case "accordion":
      return "Save changes"
    case "feedback-bar":
      return "View details"
    default:
      return "Get started"
  }
}

function humanize(value: string): string {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
}

function toHeadline(value: string): string {
  if (!value) return "Ship better interfaces"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function buildFeedbackTitle(goal: string): string {
  const cleaned = goal
    .replace(/^(create|build|design)\s+/i, "")
    .replace(/feedback bar with\s*/i, "")
    .trim()
  if (!cleaned) return "Update sent"
  const sentence = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return sentence.length > 42 ? `${sentence.slice(0, 41)}…` : sentence
}

function shorten(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}
