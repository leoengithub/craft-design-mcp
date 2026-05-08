import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerStartCraft } from "./tools/start-craft.js"
import { registerContinueCraft } from "./tools/continue-craft.js"
import { registerValidateDesign } from "./tools/validate-design.js"
import { registerListSkills } from "./tools/list-skills.js"
import { registerListDesignSystems } from "./tools/list-design-systems.js"

const server = new McpServer({
  name: "craft-design-mcp",
  version: "0.1.0",
})

registerStartCraft(server)
registerContinueCraft(server)
registerValidateDesign(server)
registerListSkills(server)
registerListDesignSystems(server)

server.prompt("craft", "Start or resume a block-by-block design workflow", () => ({
  messages: [{
    role: "user",
    content: {
      type: "text",
      text: [
        "You are running the craft-design-mcp workflow.",
        "",
        "1. Check if DESIGN.md exists in the project root.",
        "2. If it exists, read it and call start_craft({ goal: 'resume', design_md: <contents> }).",
        "3. If it does not exist, ask the user what they want to design, then call start_craft({ goal: <answer> }).",
        "4. Store the state returned by every tool call and pass it forward to every continue_craft call.",
        "5. When continue_craft returns design_md_patch, write it to DESIGN.md immediately.",
        "6. When continue_craft returns craft_context (phase: ready), state your execution intent in one sentence, then execute.",
        "7. After execution, call validate_design with a plain-language description of what you built.",
        "8. If validation fails, address failures before showing output to the user.",
      ].join("\n"),
    },
  }],
}))

const transport = new StdioServerTransport()
await server.connect(transport)
