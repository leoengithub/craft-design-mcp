import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { awaitRequestResult, createRequest } from "../agent/sessions.js"

export function registerFigmaGetContext(server: McpServer) {
  server.tool(
    "figma_get_context",
    "Read the connected Figma file context through the Craft Bridge plugin session. Returns detected colors, typography, spacing, components, and optional selected node.",
    {
      session_id: z.string(),
      timeout_ms: z.number().int().positive().max(300000).optional(),
    },
    async ({ session_id, timeout_ms }) => {
      const { requestId } = createRequest(session_id, "get_context", {})
      const result = await awaitRequestResult(session_id, requestId, timeout_ms ?? 60_000)
      return { content: [{ type: "text", text: JSON.stringify(result) }] }
    }
  )
}
