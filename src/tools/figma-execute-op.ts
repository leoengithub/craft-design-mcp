import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { awaitRequestResult, createRequest } from "../agent/sessions.js"
import { AgentOpSchema } from "../agent/op-schemas.js"

export function registerFigmaExecuteOp(server: McpServer) {
  server.tool(
    "figma_execute_op",
    "Execute one Figma operation through the Craft Bridge plugin session and wait for the result. Use for targeted edits or debugging; prefer figma_prepare_plan for multi-step changes.",
    {
      session_id: z.string(),
      op: AgentOpSchema,
      timeout_ms: z.number().int().positive().max(300000).optional(),
    },
    async ({ session_id, op, timeout_ms }) => {
      const { requestId } = createRequest(session_id, "execute_op", { op })
      const result = await awaitRequestResult(session_id, requestId, timeout_ms ?? 60_000)
      return { content: [{ type: "text", text: JSON.stringify(result) }] }
    }
  )
}
