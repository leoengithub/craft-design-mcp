import type { SemanticComponentSpec } from "../types.js"

const CATALOG: SemanticComponentSpec[] = [
  {
    id: "banner.feedback",
    category: "banner",
    slots: ["message", "primary_action", "dismiss_action"],
    variants: [{ id: "default" }, { id: "subtle" }],
    states: ["info", "success", "warning"],
    required_tokens: ["surface", "border", "text", "muted"],
    composition_rules: [
      "Use a single-line or two-line message with clear dismissal affordance.",
      "Primary action is optional; dismiss action is always present.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "navigation.primary",
    category: "navigation",
    slots: ["brand", "links", "cta"],
    variants: [{ id: "marketing" }, { id: "application" }],
    states: ["default", "sticky"],
    required_tokens: ["bg", "border", "text", "primary"],
    composition_rules: [
      "Keep CTA visually distinct from links.",
      "Brand belongs at the leading edge; CTA at the trailing edge.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "hero.section",
    category: "section",
    slots: ["eyebrow", "title", "body", "actions", "supporting_content"],
    variants: [{ id: "centered" }, { id: "split" }],
    states: ["default"],
    required_tokens: ["bg", "text", "muted", "primary"],
    composition_rules: [
      "Lead with a dominant headline and one primary action.",
      "Supporting content must not compete with the headline.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "button.primary",
    category: "action",
    slots: ["label"],
    variants: [{ id: "default" }],
    states: ["default", "hover", "disabled"],
    required_tokens: ["primary", "text"],
    composition_rules: ["Use for the dominant action only."],
    fallback_kind: "button",
  },
  {
    id: "button.secondary",
    category: "action",
    slots: ["label"],
    variants: [{ id: "default" }],
    states: ["default", "hover", "disabled"],
    required_tokens: ["surface", "border", "text"],
    composition_rules: ["Use for secondary but still actionable controls."],
    fallback_kind: "button",
  },
  {
    id: "button.ghost",
    category: "action",
    slots: ["label"],
    variants: [{ id: "default" }],
    states: ["default", "hover", "disabled"],
    required_tokens: ["text", "muted"],
    composition_rules: ["Use for low-emphasis or dismissive controls."],
    fallback_kind: "button",
  },
  {
    id: "surface.card",
    category: "surface",
    slots: ["title", "body", "footer"],
    variants: [{ id: "default" }, { id: "featured" }, { id: "compact" }],
    states: ["default"],
    required_tokens: ["surface", "border", "text", "muted"],
    composition_rules: [
      "Surface cards use border or tone separation instead of decoration.",
      "Featured cards may use stronger border or accent treatment.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "accordion.item",
    category: "disclosure",
    slots: ["summary", "detail", "actions"],
    variants: [{ id: "default" }],
    states: ["collapsed", "expanded"],
    required_tokens: ["surface", "border", "text", "muted"],
    composition_rules: [
      "Summary row is always visible; detail content is subordinate.",
      "Disclosure affordance must be obvious without extra copy.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "toolbar.group",
    category: "toolbar",
    slots: ["controls", "primary_action"],
    variants: [{ id: "default" }, { id: "dense" }],
    states: ["default"],
    required_tokens: ["bg", "border", "text", "primary"],
    composition_rules: [
      "Toolbar controls align horizontally with a single clear action edge.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "field.text",
    category: "field",
    slots: ["label", "input", "help"],
    variants: [{ id: "default" }, { id: "stacked" }],
    states: ["empty", "filled", "error"],
    required_tokens: ["surface", "border", "text", "muted"],
    composition_rules: [
      "Label and input remain visually coupled.",
      "Supportive text is subordinate to the field body.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "table.data",
    category: "data",
    slots: ["header", "rows"],
    variants: [{ id: "default" }, { id: "compact" }],
    states: ["default", "empty"],
    required_tokens: ["surface", "border", "text", "muted"],
    composition_rules: [
      "Header row is visually distinct.",
      "Rows use repetition and rhythm, not decoration.",
    ],
    fallback_kind: "stack",
  },
  {
    id: "empty-state.default",
    category: "empty-state",
    slots: ["illustration", "title", "body", "action"],
    variants: [{ id: "default" }],
    states: ["default"],
    required_tokens: ["bg", "text", "muted", "primary"],
    composition_rules: [
      "The action should clearly suggest the next useful step.",
      "The empty state should not overpower the surrounding product chrome.",
    ],
    fallback_kind: "stack",
  },
]

const byId = new Map(CATALOG.map((spec) => [spec.id, spec]))

export function listSemanticComponents(): SemanticComponentSpec[] {
  return CATALOG
}

export function getSemanticComponentSpec(id: string): SemanticComponentSpec | undefined {
  return byId.get(id)
}
