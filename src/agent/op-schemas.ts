import { z } from "zod"

const DirectionSchema = z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
const FontWeightSchema = z.enum(["Regular", "Medium", "SemiBold"])

const DesignSystemTokensSchema = z.object({
  colors: z.record(z.string()),
  typography: z.object({
    display: z.object({ family: z.string(), weight: z.string(), sizes: z.array(z.string()) }),
    body: z.object({ family: z.string(), weight: z.string(), sizes: z.array(z.string()) }),
    mono: z.object({ family: z.string() }).optional(),
  }),
  spacing: z.object({
    base: z.number(),
    scale: z.array(z.number()),
  }),
  radius: z.record(z.string()),
  shadows: z.record(z.string()),
})

const PluginSpecSchema = z.object({
  version: z.literal("1"),
  mode: z.enum(["free", "structured"]),
  block: z.string(),
  goal: z.string(),
  direction: z.object({
    id: z.string(),
    name: z.string(),
    design_system: z.string(),
  }),
  tokens: DesignSystemTokensSchema,
  brief: z.object({
    primary_action: z.string(),
    audience: z.string().optional(),
    tone: z.string().optional(),
    notes: z.array(z.string()).optional(),
  }),
  platform: z.enum(["web", "mobile", "both"]),
  constraints: z.object({
    layout_rules: z.array(z.string()),
    component_patterns: z.array(z.string()),
    anti_patterns: z.array(z.string()),
  }),
  existing_components: z.array(z.string()).optional(),
})

const RenderIntentSchema = z.object({
  artifact_name: z.string(),
  renderer: z.enum(["figma", "code"]),
  surface_kind: z.enum(["marketing", "application", "settings", "dashboard", "auth", "content", "custom"]),
  target_context: z.object({
    target_node_id: z.string().optional(),
    selection_name: z.string().optional(),
    file_session_id: z.string().optional(),
  }).optional(),
  content: z.object({
    block_tree: z.array(z.object({
      id: z.string(),
      kind: z.string(),
      purpose: z.string(),
      content: z.record(z.union([z.string(), z.array(z.string())])).optional(),
      children: z.array(z.string()).optional(),
    })),
    primary_action: z.string().optional(),
  }),
  style: z.object({
    tone: z.string().optional(),
    density: z.enum(["compact", "balanced", "spacious"]).optional(),
    platform: z.enum(["web", "mobile", "both"]).optional(),
  }),
  design_system: z.object({
    source: z.literal("craft"),
    tokens: z.array(z.string()),
    component_preferences: z.array(z.string()),
    anti_patterns: z.array(z.string()),
  }),
  execution: z.object({
    auto_run: z.boolean(),
    reuse_existing_assets: z.boolean(),
    materialize_missing_assets: z.boolean(),
    persist_generated_assets: z.boolean(),
  }),
})

const RenderBlockPlanSchema = z.object({
  artifact_name: z.string(),
  asset_section_name: z.string(),
  block: z.string(),
  goal: z.string(),
  platform: z.enum(["web", "mobile", "both"]),
  mode: z.enum(["free", "structured"]),
  layout: z.enum(["hero", "navigation", "feedback-bar", "pricing", "feature-grid", "kpi-summary", "data-table", "sidebar", "form", "empty-state", "footer", "toolbar", "accordion", "generic"]),
  direction: z.object({
    id: z.string(),
    name: z.string(),
    design_system: z.string(),
  }),
  tokens: DesignSystemTokensSchema,
  style: z.object({
    primary: z.string(),
    bg: z.string(),
    surface: z.string(),
    text: z.string(),
    muted: z.string(),
    border: z.string(),
    accent: z.string().optional(),
  }),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    cta_label: z.string().optional(),
    secondary_cta_label: z.string().optional(),
    stats: z.array(z.object({
      label: z.string(),
      value: z.string(),
      delta: z.string().optional(),
    })).optional(),
    items: z.array(z.object({
      title: z.string(),
      body: z.string().optional(),
      badge: z.string().optional(),
      meta: z.string().optional(),
    })).optional(),
    columns: z.array(z.object({
      title: z.string(),
      price: z.string().optional(),
      body: z.string().optional(),
      cta_label: z.string().optional(),
      featured: z.boolean().optional(),
      bullets: z.array(z.string()).optional(),
    })).optional(),
    links: z.array(z.string()).optional(),
  }),
})

const RenderTextRoleSchema = z.enum(["display", "headline", "subheadline", "body", "label", "caption"])
const ResolutionSourceSchema = z.enum(["codebase", "craft_ds", "local_figma", "materialized_local", "primitive"])

const SemanticNodeSchema = z.object({
  component_id: z.string(),
  variant: z.string().optional(),
  state: z.string().optional(),
  slots: z.record(z.string()).optional(),
  token_overrides: z.record(z.string()).optional(),
  resolution_target: z.enum(["codebase", "design_system", "auto"]).optional(),
  allow_fallback: z.boolean().optional(),
}).optional()

const ResolvedComponentSchema = z.object({
  semantic_component_id: z.string(),
  source: ResolutionSourceSchema,
  target_name: z.string(),
  variant: z.string().optional(),
  state: z.string().optional(),
  mapping_name: z.string().optional(),
  allow_fallback: z.boolean(),
}).optional()

const RenderTreeNodeSchema: z.ZodTypeAny = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("stack"),
      name: z.string(),
      direction: z.enum(["VERTICAL", "HORIZONTAL"]),
      gap: z.number().optional(),
      padding: z.number().optional(),
      width: z.number().optional(),
      min_height: z.number().optional(),
      fill: z.string().optional(),
      stroke: z.string().optional(),
      radius: z.number().optional(),
      align: z.enum(["MIN", "CENTER", "SPACE_BETWEEN"]).optional(),
      children: z.array(RenderTreeNodeSchema),
      semantic: SemanticNodeSchema,
      resolution: ResolvedComponentSchema,
    }),
    z.object({
      kind: z.literal("text"),
      text: z.string(),
      role: RenderTextRoleSchema,
      color: z.string().optional(),
      max_width: z.number().optional(),
      align: z.enum(["LEFT", "CENTER"]).optional(),
      semantic: SemanticNodeSchema,
      resolution: ResolvedComponentSchema,
    }),
    z.object({
      kind: z.literal("button"),
      label: z.string(),
      variant: z.enum(["primary", "secondary", "ghost"]),
      semantic: SemanticNodeSchema,
      resolution: ResolvedComponentSchema,
    }),
    z.object({
      kind: z.literal("badge"),
      label: z.string(),
      semantic: SemanticNodeSchema,
      resolution: ResolvedComponentSchema,
    }),
    z.object({
      kind: z.literal("divider"),
      semantic: SemanticNodeSchema,
      resolution: ResolvedComponentSchema,
    }),
    z.object({
      kind: z.literal("spacer"),
      size: z.number(),
      semantic: SemanticNodeSchema,
      resolution: ResolvedComponentSchema,
    }),
  ])
)

const RenderTreePlanSchema = z.object({
  artifact_name: z.string(),
  asset_section_name: z.string(),
  goal: z.string(),
  block: z.string(),
  platform: z.enum(["web", "mobile", "both"]),
  tokens: DesignSystemTokensSchema,
  palette: z.object({
    primary: z.string(),
    bg: z.string(),
    surface: z.string(),
    text: z.string(),
    muted: z.string(),
    border: z.string(),
    accent: z.string().optional(),
  }),
  root: RenderTreeNodeSchema,
})

export const AgentOpSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("get_context") }),
  z.object({
    op: z.literal("create_frame"),
    name: z.string(),
    width: z.number(),
    height: z.number(),
    direction: DirectionSchema.optional(),
    padding: z.number().optional(),
    gap: z.number().optional(),
    fill: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
  }),
  z.object({
    op: z.literal("create_text"),
    text: z.string(),
    fontSize: z.number().optional(),
    fontWeight: FontWeightSchema.optional(),
    fill: z.string().optional(),
    parentId: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
  }),
  z.object({
    op: z.literal("apply_fill"),
    nodeId: z.string(),
    hex: z.string(),
  }),
  z.object({
    op: z.literal("set_text"),
    nodeId: z.string(),
    text: z.string(),
  }),
  z.object({
    op: z.literal("render_block"),
    plan: RenderBlockPlanSchema,
  }),
  z.object({
    op: z.literal("render_tree"),
    plan: RenderTreePlanSchema,
  }),
  z.object({
    op: z.literal("scaffold_block"),
    spec: PluginSpecSchema,
  }),
])

export const AgentOpArraySchema = z.array(AgentOpSchema).min(1)
export const RenderIntentInputSchema = RenderIntentSchema
