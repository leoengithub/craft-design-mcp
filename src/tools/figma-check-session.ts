import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getExistingSessionStatus } from "../agent/sessions.js"

export function registerFigmaCheckSession(server: McpServer) {
  server.tool(
    "figma_check_session",
    "Check whether a Craft Bridge Figma session is active and whether the local bridge can see it. Use this before committing the workflow to Figma rendering.",
    {
      session_id: z.string(),
    },
    async ({ session_id }) => {
      const status = getExistingSessionStatus(session_id)
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            session_id,
            ok: status.ok,
            connected: status.connected,
            pending_count: status.pending_count,
            hint: status.ok
              ? "Craft Bridge session is active."
              : "Craft Bridge is not active for this session. Open the plugin in Figma, wait for 'Bridge connected', and copy the visible session ID.",
          }),
        }],
      }
    }
  )
}
