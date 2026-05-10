import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { awaitRequestResult, createRequest } from "../agent/sessions.js"
import { RenderIntentInputSchema } from "../agent/op-schemas.js"

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
  tokens: z.object({
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
  }),
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

export function registerFigmaRenderTree(server: McpServer) {
  server.tool(
    "figma_render_tree",
    "Render a Craft render_tree directly in Figma through the plugin. This is the primary path for final design rendering because it gives the plugin a general design composition tree instead of low-level drawing ops.",
    {
      session_id: z.string(),
      render_tree: RenderTreePlanSchema,
      render_intent: RenderIntentInputSchema.optional(),
      timeout_ms: z.number().int().positive().max(300000).optional(),
    },
    async ({ session_id, render_tree, render_intent, timeout_ms }) => {
      const ops = [{ op: "render_tree" as const, plan: render_tree }]
      const { requestId } = createRequest(session_id, "execute_plan", {
        description: `Render tree "${render_tree.artifact_name}"`,
        ops,
        render_intent,
      })
      const result = await awaitRequestResult(session_id, requestId, timeout_ms ?? 300_000)
      return {
        content: [{ type: "text", text: JSON.stringify({ request_id: requestId, result }) }],
      }
    }
  )
}
