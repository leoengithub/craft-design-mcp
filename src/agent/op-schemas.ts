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
    op: z.literal("scaffold_block"),
    spec: PluginSpecSchema,
  }),
])

export const AgentOpArraySchema = z.array(AgentOpSchema).min(1)
