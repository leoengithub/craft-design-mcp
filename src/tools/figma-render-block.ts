import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { awaitRequestResult, createRequest } from "../agent/sessions.js"
import { RenderIntentInputSchema } from "../agent/op-schemas.js"

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

export function registerFigmaRenderBlock(server: McpServer) {
  server.tool(
    "figma_render_block",
    "Render a Craft render_plan directly in Figma through the plugin. This is the primary path for final design rendering. Prefer this over manually composing low-level ops.",
    {
      session_id: z.string(),
      render_plan: RenderBlockPlanSchema,
      render_intent: RenderIntentInputSchema.optional(),
      timeout_ms: z.number().int().positive().max(300000).optional(),
    },
    async ({ session_id, render_plan, render_intent, timeout_ms }) => {
      const ops = [{ op: "render_block" as const, plan: render_plan }]
      const { requestId } = createRequest(session_id, "execute_plan", {
        description: `Render ${render_plan.layout} block "${render_plan.artifact_name}"`,
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
