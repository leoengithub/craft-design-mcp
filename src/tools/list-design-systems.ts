import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getDesignSystemIndex } from "../design-systems/loader.js"

export function registerListDesignSystems(server: McpServer) {
  server.tool(
    "list_design_systems",
    "Returns all available design systems. Uses the metadata index — does not load full system files.",
    {
      filter: z.string().optional(),
    },
    async ({ filter }) => {
      const index = await getDesignSystemIndex()
      const results = filter
        ? index.filter(s => s.name.includes(filter) || s.label.toLowerCase().includes(filter.toLowerCase()))
        : index
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      }
    }
  )
}
