import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createRequest } from "../agent/sessions.js"
import { AgentOpArraySchema, RenderIntentInputSchema } from "../agent/op-schemas.js"

export function registerFigmaPreparePlan(server: McpServer) {
  server.tool(
    "figma_prepare_plan",
    "Queue a multi-operation Figma plan for the Craft Bridge plugin. For normal create flows the plugin auto-runs the plan immediately. Include render_intent when available so the plugin can create or reuse the local Craft asset section next to the rendered artifact. Call figma_wait_for_result with the returned request_id to await completion.",
    {
      session_id: z.string(),
      description: z.string(),
      ops: AgentOpArraySchema,
      render_intent: RenderIntentInputSchema.optional(),
    },
    async ({ session_id, description, ops, render_intent }) => {
      const { requestId } = createRequest(session_id, "execute_plan", { description, ops, render_intent })
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            request_id: requestId,
            status: "queued",
          }),
        }],
      }
    }
  )
}
