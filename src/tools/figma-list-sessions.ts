import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { listActiveSessions } from "../agent/sessions.js"

export function registerFigmaListSessions(server: McpServer) {
  server.tool(
    "figma_list_sessions",
    "List active Craft Bridge Figma sessions seen by the local bridge. Use this to auto-select the session when exactly one plugin is active.",
    {},
    async () => {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            sessions: listActiveSessions(),
          }),
        }],
      }
    }
  )
}
