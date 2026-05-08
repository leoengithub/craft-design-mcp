import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getSkillIndex } from "../skills/loader.js"

export function registerListSkills(server: McpServer) {
  server.tool(
    "list_skills",
    "Returns all available block types. Uses the skill metadata index — does not load full SKILL.md files.",
    {
      filter: z.string().optional().describe("Optional keyword filter"),
    },
    async ({ filter }) => {
      const index = await getSkillIndex()
      const results = filter
        ? index.filter(s => s.block_type.includes(filter) || s.label.toLowerCase().includes(filter.toLowerCase()))
        : index
      return {
        content: [{ type: "text", text: JSON.stringify(results) }],
      }
    }
  )
}
