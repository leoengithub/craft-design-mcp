import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createRequest } from "../agent/sessions.js"
import { AgentOpArraySchema } from "../agent/op-schemas.js"

export function registerFigmaPreparePlan(server: McpServer) {
  server.tool(
    "figma_prepare_plan",
    "Queue a multi-operation Figma plan for the Craft Bridge plugin. The plugin shows the plan to the user for approval before running any ops. Call figma_wait_for_result with the returned request_id to await completion.",
    {
      session_id: z.string(),
      description: z.string(),
      ops: AgentOpArraySchema,
    },
    async ({ session_id, description, ops }) => {
      const { requestId } = createRequest(session_id, "execute_plan", { description, ops })
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            request_id: requestId,
            status: "pending_approval",
          }),
        }],
      }
    }
  )
}
