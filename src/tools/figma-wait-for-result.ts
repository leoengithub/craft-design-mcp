import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { awaitRequestResult } from "../agent/sessions.js"

export function registerFigmaWaitForResult(server: McpServer) {
  server.tool(
    "figma_wait_for_result",
    "Wait for a previously queued Figma request to finish. Use this after figma_prepare_plan, or to resume waiting on a pending request after a host interruption.",
    {
      session_id: z.string(),
      request_id: z.string(),
      timeout_ms: z.number().int().positive().max(300000).optional(),
    },
    async ({ session_id, request_id, timeout_ms }) => {
      const result = await awaitRequestResult(session_id, request_id, timeout_ms ?? 300_000)
      return { content: [{ type: "text", text: JSON.stringify(result) }] }
    }
  )
}
