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
        "## Questioning style (applies to every phase that asks questions)",
        "- Ask one question at a time — never present a numbered list of questions all at once.",
        "- Before waiting for the user's answer, state your own recommendation in parentheses.",
        "  Example: 'Who is the primary user? (I'd assume developers based on the goal — confirm or redirect)'",
        "- If the user's answer is vague or opens a new branch, ask one follow-up before moving on.",
        "- If any question can be answered by reading project files (package.json, README, existing CSS,",
        "  tailwind.config, src/), read them instead of asking. State what you found.",
        "- Keep questions tight. Do not explain why you are asking — just ask.",
        "",
        "## Workflow steps",
        "1. Check if DESIGN.md exists in the project root.",
        "2. Check if COMPONENTS.md exists in the project root. If it does, read it.",
        "3. Check if craft-ds.md exists in the project root. If it does, read it.",
        "4. If DESIGN.md exists: call start_craft({ goal: 'resume', design_md: <contents>, components_md?: <contents>, craft_ds_md?: <contents> }).",
        "5. If DESIGN.md does not exist: ask the user what they want to design, then call start_craft({ goal: <answer>, components_md?: <contents>, craft_ds_md?: <contents> }).",
        "6. Store the state returned by every tool call and pass it forward to every continue_craft call.",
        "7. When continue_craft returns design_md_patch, write it to DESIGN.md immediately.",
        "8. When continue_craft returns craft_context (phase: ready), state your execution intent in one sentence, then execute.",
        "   If craft_context.existing_components is present, reuse those components — do not rebuild them.",
        "9. After execution, call validate_design with a plain-language description of what you built.",
        "10. If validation fails, address failures before showing output to the user.",
      ].join("\n"),
    },
  }],
}))

server.prompt("craft-setup", "Scaffold craft-ds.md and COMPONENTS.md from your existing codebase", () => ({
  messages: [{
    role: "user",
    content: {
      type: "text",
      text: [
        "You are running the craft-setup workflow. Your job is to generate two files in the project root:",
        "  1. craft-ds.md — the project's design token file for craft-design-mcp",
        "  2. COMPONENTS.md — a list of reusable components that already exist in this codebase",
        "",
        "## Step 1 — Discover design tokens",
        "Search for design token sources in this order (stop when you find one):",
        "  a. tailwind.config.ts / tailwind.config.js — look for theme.extend.colors, fontSize, spacing, borderRadius",
        "  b. CSS files with :root { --color-* } or similar CSS custom properties",
        "  c. A theme file (theme.ts, tokens.ts, design-tokens.json, or similar)",
        "  d. A constants file that exports color or typography values",
        "If none found, ask the user to provide brand colors and fonts before continuing.",
        "",
        "## Step 2 — Generate craft-ds.md",
        "Write craft-ds.md to the project root using this exact format:",
        "```",
        "---",
        "craft:",
        "  name:          custom",
        "  label:         <project name or 'My Brand'>",
        "  direction_fit: [focused-calm]",
        "  version:       1.0.0",
        "---",
        "",
        "## Color",
        "| Token | Hex | Description |",
        "|-------|-----|-------------|",
        "| primary | #... | ... |",
        "| bg | #... | ... |",
        "| text | #... | ... |",
        "| border | #... | ... |",
        "(add more rows as found)",
        "",
        "## Typography",
        "| Role | Size | Weight | Usage |",
        "|------|------|--------|-------|",
        "| Display | ...px | ... | ... |",
        "| Body | ...px | ... | ... |",
        "",
        "Typeface: <primary font family>",
        "",
        "## Spacing",
        "Base unit: <base>px",
        "Scale: <values separated by />",
        "",
        "## Layout",
        "(describe max-width, grid, padding from codebase)",
        "",
        "## Components",
        "(describe button, card, input styles as found in code)",
        "",
        "## Motion",
        "(describe transition durations and easing from code, or 'No custom animation')",
        "",
        "## Voice",
        "(describe copy tone from existing UI text, or 'Not defined')",
        "",
        "## Brand",
        "(describe the visual feel in 2–3 sentences based on what you found)",
        "",
        "## Anti-patterns",
        "- (list 3–5 things the codebase clearly avoids or you recommend avoiding)",
        "```",
        "",
        "## Step 3 — Discover existing components",
        "Search for reusable UI components:",
        "  a. src/components/, components/, app/components/, lib/components/, or similar",
        "  b. Look for .tsx, .jsx, .vue, or .svelte files that export a single named component",
        "  c. Include only components that are clearly reusable UI primitives or blocks",
        "     (Button, Card, Modal, Input, Badge, Avatar, Table, etc.)",
        "  d. Skip page files, layout files, and one-off components",
        "",
        "## Step 4 — Generate COMPONENTS.md",
        "Write COMPONENTS.md to the project root:",
        "```",
        "# Project Components",
        "",
        "Components already in this codebase. craft-design-mcp will reuse these instead of rebuilding them.",
        "",
        "- ComponentName — relative/path/to/File.tsx",
        "- ComponentName — relative/path/to/File.tsx",
        "```",
        "",
        "When done, confirm both files were written and tell the user to run /craft to start designing.",
      ].join("\n"),
    },
  }],
}))

const transport = new StdioServerTransport()
await server.connect(transport)
