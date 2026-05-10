import type {
  CraftContext,
  CraftWorkflowState,
  RenderBlockPlan,
  RenderTreeNode,
  RenderTreePlan,
  SemanticNodeMetadata,
} from "../types.js"
import { buildRenderBlockPlan } from "./render-plan.js"

export function buildRenderTreePlan(state: CraftWorkflowState, craftContext: CraftContext): RenderTreePlan {
  const blockPlan = buildRenderBlockPlan(state, craftContext)

  return {
    artifact_name: blockPlan.artifact_name,
    asset_section_name: blockPlan.asset_section_name,
    goal: blockPlan.goal,
    block: blockPlan.block,
    platform: blockPlan.platform,
    tokens: blockPlan.tokens,
    palette: {
      primary: blockPlan.style.primary,
      bg: blockPlan.style.bg,
      surface: blockPlan.style.surface,
      text: blockPlan.style.text,
      muted: blockPlan.style.muted,
      border: blockPlan.style.border,
      accent: blockPlan.style.accent,
    },
    root: buildRootTree(blockPlan),
  }
}

function buildRootTree(plan: RenderBlockPlan): RenderTreeNode {
  const width = plan.platform === "mobile" ? 390 : plan.layout === "sidebar" ? 280 : 1440
  const padding = plan.platform === "mobile" ? 24 : 32

  switch (plan.layout) {
    case "feedback-bar":
      return feedbackBarTree(plan, width)
    case "navigation":
      return navigationTree(plan, width, padding)
    case "hero":
      return heroTree(plan, width, padding)
    case "pricing":
      return pricingTree(plan, width, padding)
    case "accordion":
      return accordionTree(plan, width, padding)
    case "toolbar":
      return toolbarTree(plan, width, padding)
    case "form":
      return formTree(plan, width, padding)
    case "sidebar":
      return sidebarTree(plan, width, padding)
    case "empty-state":
      return emptyStateTree(plan, width, padding)
    case "kpi-summary":
      return kpiTree(plan, width, padding)
    case "feature-grid":
      return featureGridTree(plan, width, padding)
    case "data-table":
      return dataTableTree(plan, width, padding)
    case "footer":
      return footerTree(plan, width, padding)
    case "generic":
    default:
      return genericTree(plan, width, padding)
  }
}

function feedbackBarTree(plan: RenderBlockPlan, width: number): RenderTreeNode {
  return stack("FeedbackBar", "HORIZONTAL", [
    stack("Feedback Copy", "VERTICAL", [
      text(plan.content.title ?? plan.artifact_name, "label"),
      ...(plan.content.body ? [text(plan.content.body, "body", plan.style.muted, 760)] : []),
    ], { gap: 6 }),
    stack("Feedback Actions", "HORIZONTAL", [
      ...(plan.content.cta_label ? [button(plan.content.cta_label, "secondary")] : []),
      button(plan.content.secondary_cta_label ?? "Dismiss", "ghost"),
    ], { gap: 10 }),
  ], {
    width,
    min_height: 84,
    fill: plan.style.surface,
    stroke: plan.style.border,
    radius: 12,
    padding: 20,
    gap: 20,
    align: "SPACE_BETWEEN",
  }, {
    component_id: "banner.feedback",
    variant: "default",
    slots: {
      message: plan.content.body ?? plan.content.title ?? plan.artifact_name,
      primary_action: plan.content.cta_label ?? "",
      dismiss_action: plan.content.secondary_cta_label ?? "Dismiss",
    },
  })
}

function navigationTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return stack("Navigation", "HORIZONTAL", [
    text(plan.content.title ?? plan.artifact_name, "subheadline"),
    stack("Links", "HORIZONTAL", (plan.content.links ?? []).map((link) => text(link, "body", plan.style.muted)), { gap: 16 }),
    ...(plan.content.cta_label ? [button(plan.content.cta_label, "primary")] : []),
  ], {
    width,
    min_height: 72,
    fill: plan.style.bg,
    stroke: plan.style.border,
    padding,
    gap: 24,
    align: "SPACE_BETWEEN",
  }, {
    component_id: "navigation.primary",
    variant: /dashboard|admin|analytics/i.test(plan.goal) ? "application" : "marketing",
  })
}

function heroTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return stack("Hero", "VERTICAL", [
    ...(plan.content.eyebrow ? [badge(plan.content.eyebrow)] : []),
    ...(plan.content.title ? [text(plan.content.title, "display", undefined, 860, "CENTER")] : []),
    ...(plan.content.body ? [text(plan.content.body, "body", plan.style.muted, 760, "CENTER")] : []),
    stack("Hero Actions", "HORIZONTAL", [
      ...(plan.content.cta_label ? [button(plan.content.cta_label, "primary")] : []),
      ...(plan.content.secondary_cta_label ? [button(plan.content.secondary_cta_label, "secondary")] : []),
    ], { gap: 12 }),
    ...(plan.content.items?.length
      ? [stack("Hero Cards", width < 500 ? "VERTICAL" : "HORIZONTAL", plan.content.items.slice(0, 3).map((item) => card(item.title, item.body ?? "")), { gap: 16 })]
      : []),
  ], {
    width,
    min_height: plan.platform === "mobile" ? 620 : 760,
    fill: plan.style.bg,
    padding: plan.platform === "mobile" ? 32 : padding * 2,
    gap: 24,
    align: "CENTER",
  }, {
    component_id: "hero.section",
    variant: "centered",
  })
}

function pricingTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return sectionWithHeader(plan, width, padding, [
    stack("Pricing Cards", width < 500 ? "VERTICAL" : "HORIZONTAL", (plan.content.columns ?? []).map((column) =>
      card(column.title, [column.price, column.body, ...(column.bullets ?? [])].filter(Boolean).join("\n"), {
        featured: column.featured,
        footer: column.cta_label ? button(column.cta_label, column.featured ? "primary" : "secondary") : undefined,
      })
    ), { gap: 16 }),
  ])
}

function accordionTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return sectionWithHeader(plan, width, padding, (plan.content.items ?? []).map((item) =>
    stack(item.title, "VERTICAL", [
      text(item.title, "label"),
      ...(item.body ? [text(item.body, "body", plan.style.muted)] : []),
    ], {
      fill: "#FFFFFF",
      stroke: "#E5E5E5",
      radius: 12,
      padding: 16,
      gap: 8,
    }, {
      component_id: "accordion.item",
      variant: "default",
      state: "collapsed",
      slots: { summary: item.title, detail: item.body ?? "" },
    })
  ))
}

function toolbarTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return stack("Toolbar", "HORIZONTAL", [
    stack("Toolbar Chips", "HORIZONTAL", (plan.content.items ?? []).map((item) => badge(item.title)), { gap: 12 }),
    ...(plan.content.cta_label ? [button(plan.content.cta_label, "primary")] : []),
  ], {
    width,
    min_height: 72,
    fill: plan.style.bg,
    stroke: plan.style.border,
    padding,
    gap: 24,
    align: "SPACE_BETWEEN",
  }, {
    component_id: "toolbar.group",
    variant: plan.content.items && plan.content.items.length > 4 ? "dense" : "default",
  })
}

function formTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return sectionWithHeader(plan, width, padding, [
    cardStack("Form Card", [
      ...(plan.content.items ?? []).map((item) =>
        stack(item.title, "VERTICAL", [
          text(item.title, "label"),
          card(item.body ?? "Enter value", "", { compact: true, mutedTitle: true }),
        ], { gap: 8 }, {
          component_id: "field.text",
          variant: "stacked",
          slots: { label: item.title, input: item.body ?? "Enter value" },
        })
      ),
      ...(plan.content.cta_label ? [button(plan.content.cta_label, "primary")] : []),
    ]),
  ])
}

function sidebarTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return stack("Sidebar", "VERTICAL", [
    text(plan.content.title ?? plan.artifact_name, "headline"),
    ...(plan.content.links ?? []).map((link) => card(link, "", { compact: true, mutedTitle: false })),
  ], {
    width,
    min_height: 760,
    fill: plan.style.surface,
    stroke: plan.style.border,
    padding,
    gap: 12,
  }, {
    component_id: "navigation.primary",
    variant: "application",
  })
}

function emptyStateTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return stack("EmptyState", "VERTICAL", [
    card("No content yet", "", { compact: false }),
    ...(plan.content.title ? [text(plan.content.title, "headline", undefined, 640, "CENTER")] : []),
    ...(plan.content.body ? [text(plan.content.body, "body", plan.style.muted, 560, "CENTER")] : []),
    ...(plan.content.cta_label ? [button(plan.content.cta_label, "primary")] : []),
  ], {
    width,
    min_height: 420,
    fill: plan.style.bg,
    padding,
    gap: 16,
    align: "CENTER",
  }, {
    component_id: "empty-state.default",
    variant: "default",
  })
}

function kpiTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return sectionWithHeader(plan, width, padding, [
    stack("KPI Row", width < 500 ? "VERTICAL" : "HORIZONTAL", (plan.content.stats ?? []).map((stat) =>
      card(stat.value, stat.label, { eyebrow: stat.delta, compact: true, featured: true })
    ), { gap: 16 }),
  ])
}

function featureGridTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return sectionWithHeader(plan, width, padding, [
    stack("Feature Grid", width < 500 ? "VERTICAL" : "HORIZONTAL", (plan.content.items ?? []).map((item) => card(item.title, item.body ?? "", { compact: true })), { gap: 16 }),
  ])
}

function dataTableTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  const columns = (plan.content.items ?? []).map((item) => item.title)
  return sectionWithHeader(plan, width, padding, [
    cardStack("Data Table", [
      stack("Table Header", "HORIZONTAL", columns.map((column) => text(column, "label")), { gap: 16 }),
      divider(),
      ...Array.from({ length: 4 }, (_, row) =>
        stack(`Row ${row + 1}`, "HORIZONTAL", columns.map((column, index) => text(`${column} ${row + index + 1}`, "body", plan.style.muted)), { gap: 16 })
      ),
    ], { width: width - padding * 2, semantic: { component_id: "table.data", variant: "compact" } }),
  ])
}

function footerTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return stack("Footer", width < 500 ? "VERTICAL" : "HORIZONTAL", [
    card(plan.content.title ?? plan.artifact_name, plan.content.body ?? "", { compact: true }),
    stack("Footer Links", "HORIZONTAL", (plan.content.links ?? []).map((link) => stack(link, "VERTICAL", [text(link, "label"), text("Detail", "caption", plan.style.muted)], { gap: 6 })), { gap: 24 }),
  ], {
    width,
    min_height: 220,
    fill: plan.style.bg,
    stroke: plan.style.border,
    padding,
    gap: 24,
    align: "SPACE_BETWEEN",
  })
}

function genericTree(plan: RenderBlockPlan, width: number, padding: number): RenderTreeNode {
  return sectionWithHeader(plan, width, padding, [
    ...(plan.content.items?.length ? [stack("Generic Items", "VERTICAL", plan.content.items.map((item) => card(item.title, item.body ?? "", { compact: true })), { gap: 12 })] : []),
    ...(plan.content.cta_label ? [button(plan.content.cta_label, "primary")] : []),
  ])
}

function sectionWithHeader(plan: RenderBlockPlan, width: number, padding: number, children: RenderTreeNode[]): RenderTreeNode {
  return stack(plan.artifact_name, "VERTICAL", [
    ...(plan.content.eyebrow ? [badge(plan.content.eyebrow)] : []),
    ...(plan.content.title ? [text(plan.content.title, "headline")] : []),
    ...(plan.content.body ? [text(plan.content.body, "body", plan.style.muted, 720)] : []),
    ...children,
  ], {
    width,
    min_height: 420,
    fill: plan.style.bg,
    stroke: plan.layout === "generic" ? plan.style.border : undefined,
    radius: plan.layout === "generic" ? 12 : undefined,
    padding,
    gap: 16,
  }, semanticForLayout(plan.layout))
}

function stack(
  name: string,
  direction: "VERTICAL" | "HORIZONTAL",
  children: RenderTreeNode[],
  options: Omit<Extract<RenderTreeNode, { kind: "stack" }>, "kind" | "name" | "direction" | "children" | "semantic" | "resolution"> = {},
  semantic?: SemanticNodeMetadata,
): RenderTreeNode {
  return { kind: "stack", name, direction, children, ...options, ...(semantic ? { semantic } : {}) }
}

function text(textValue: string, role: "display" | "headline" | "subheadline" | "body" | "label" | "caption", color?: string, max_width?: number, align?: "LEFT" | "CENTER"): RenderTreeNode {
  return { kind: "text", text: textValue, role, color, max_width, align }
}

function button(label: string, variant: "primary" | "secondary" | "ghost"): RenderTreeNode {
  return {
    kind: "button",
    label,
    variant,
    semantic: {
      component_id: `button.${variant}`,
      variant,
      slots: { label },
    },
  }
}

function badge(label: string): RenderTreeNode {
  return {
    kind: "badge",
    label,
    semantic: {
      component_id: "surface.card",
      variant: "compact",
      slots: { label },
    },
  }
}

function divider(): RenderTreeNode {
  return { kind: "divider" }
}

function card(title: string, body: string, options: { eyebrow?: string; compact?: boolean; featured?: boolean; footer?: RenderTreeNode; mutedTitle?: boolean } = {}): RenderTreeNode {
  return stack(title, "VERTICAL", [
    ...(options.eyebrow ? [text(options.eyebrow, "caption")] : []),
    text(title, options.compact ? "label" : "subheadline", options.mutedTitle ? undefined : undefined),
    ...(body ? [text(body, "body")] : []),
    ...(options.footer ? [options.footer] : []),
  ], {
    fill: "#FFFFFF",
    stroke: "#E5E5E5",
    radius: 12,
    padding: options.compact ? 16 : 20,
    gap: options.compact ? 8 : 12,
  }, {
    component_id: "surface.card",
    variant: options.featured ? "featured" : options.compact ? "compact" : "default",
    slots: { title, body },
  })
}

function cardStack(name: string, children: RenderTreeNode[], options: { width?: number; semantic?: SemanticNodeMetadata } = {}): RenderTreeNode {
  return stack(name, "VERTICAL", children, {
    width: options.width,
    fill: "#FFFFFF",
    stroke: "#E5E5E5",
    radius: 12,
    padding: 20,
    gap: 16,
  }, options.semantic ?? {
    component_id: "surface.card",
    variant: "default",
  })
}

function semanticForLayout(layout: RenderBlockPlan["layout"]): SemanticNodeMetadata | undefined {
  switch (layout) {
    case "pricing":
      return { component_id: "surface.card", variant: "default", allow_fallback: true }
    case "accordion":
      return { component_id: "accordion.item", variant: "default", allow_fallback: true }
    case "generic":
      return { component_id: "surface.card", variant: "default", allow_fallback: true }
    default:
      return undefined
  }
}
