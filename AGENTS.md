# AGENTS.md — craft-design-mcp

Instructions for AI agents working in this codebase.

---

## What this project is

An MCP server that gives AI agents a structured design thinking layer before they touch any execution tool. It is a pure state machine — no server-side session memory. Every tool call receives full state in, returns updated state out.

---

## Running the server

```bash
pnpm dev          # development (tsx watch)
pnpm build        # compile to dist/
pnpm start        # run compiled server
pnpm typecheck    # type check without emitting
pnpm test         # run tests
```

Connect to Claude Code or Cursor by adding to your MCP config:
```json
{
  "mcpServers": {
    "craft-design-mcp": {
      "command": "node",
      "args": ["/path/to/craft-design-mcp/dist/index.js"]
    }
  }
}
```

---

## Project structure

```
src/
  index.ts                  ← MCP server entry, tool registration, /craft prompt
  types.ts                  ← All shared types (CraftWorkflowState, CraftContext, etc.)
  tools/
    start-craft.ts          ← Entry point tool
    continue-craft.ts       ← Workflow engine (state machine)
    validate-design.ts      ← Constraint checklist
    list-skills.ts          ← Skill metadata index
    list-design-systems.ts  ← Design system metadata index
  skills/
    loader.ts               ← Lazy-loading SKILL.md parser
  design-systems/
    loader.ts               ← Lazy-loading design system parser
skills/
  hero-section/SKILL.md     ← Block contract files (data, not code)
  navigation/SKILL.md
  pricing-row/SKILL.md
design-systems/
  linear.md                 ← Design system token files (data, not code)
  notion.md
  posthog.md
```

---

## The state contract

The MCP is stateless. No server memory between calls. The agent owns state.

```typescript
// Every continue_craft call:
input:  { state: CraftWorkflowState, action: ContinueCraftAction }
output: { state: CraftWorkflowState, design_md_patch?, craft_context?, ... }
```

When `design_md_patch` is present in the output, the agent must write it to `DESIGN.md` in the project root before the next call.

When `craft_context` is present (phase: `"ready"`), the agent executes the design using whatever tool is available, then calls `validate_design`.

---

## Adding a skill

1. Create `skills/<block-type>/SKILL.md` following the format in existing files
2. Required sections: Purpose, Required elements, Layout rules, Component patterns, Anti-patterns, Self-critique checklist, Example prompts
3. Minimum: 5 anti-patterns, 2 P0 checklist items (`- [ ] P0: ...`), 3 example prompts
4. Restart the server — the skill is available immediately (lazy-loaded at startup from frontmatter only)

No code changes required for new skills.

---

## Adding a design system

1. Create `design-systems/<name>.md` following the format in existing files
2. Required sections: Color (with token table), Typography, Spacing, Layout, Components, Motion, Voice, Brand, Anti-patterns
3. The `craft:` frontmatter must include `name`, `label`, `reference`, `direction_fit`
4. Restart the server

No code changes required for new design systems.

---

## Type safety rules

- All tool inputs are validated with Zod schemas
- `CraftWorkflowState` is the single source of truth for workflow state — do not add ad-hoc fields
- `ContinueCraftAction` is a discriminated union — add new action types here when extending the workflow
- Run `pnpm typecheck` before committing — CI will reject type errors

---

## What validate_design can and cannot do

`validate_design` checks a plain-language **description** against skill constraints. It:
- ✅ Catches self-reported anti-pattern violations
- ✅ Catches missing required elements in the description
- ❌ Cannot inspect Figma frames, screenshots, or generated code
- ❌ Cannot verify visual quality or intent match

The user is always the final quality gate on visual output.

---

## Extending the workflow

The state machine lives in `src/tools/continue-craft.ts`. Each `action.type` maps to a transition function. To add a new step:

1. Add the action type to `ContinueCraftAction` in `src/types.ts`
2. Add the new phase (if needed) to `WorkflowPhase` in `src/types.ts`
3. Add the case to the `advance()` switch in `continue-craft.ts`
4. Update `04-tools-spec.md` in the design docs

---

## What NOT to do

- Do not add server-side session state — the MCP is stateless by design
- Do not write to `DESIGN.md` from within the MCP server — return `design_md_patch` and let the agent write it
- Do not load full SKILL.md or design system files at startup — use the lazy loaders
- Do not add logic to `index.ts` beyond server setup and tool registration
