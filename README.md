# craft-design-mcp

**Block-level design intelligence for AI coding agents.**

craft-design-mcp is a Model Context Protocol server that gives agents like Claude Code and Cursor a structured design thinking layer before they touch any code. It now also acts as the design brain for Craft Bridge: the MCP resolves semantic components, runs critique and pre-render lint, and sends a disciplined payload to Figma instead of leaving layout taste to the host agent.

---

## The problem it solves

Left to their own devices, AI agents produce generic UI: hero sections with three CTAs, gradients everywhere, "Get started" buttons, and data tables with no empty state. They optimize for plausibility, not for craft.

craft-design-mcp fixes this by forcing a structured brief before execution:

- **One block at a time.** Not pages. Not full apps. One focused block per session — a hero section, a navigation bar, a pricing table. Full designs emerge from many focused sessions.
- **Questions before pixels.** The agent collects audience, tone, and block-specific intent before it designs anything.
- **Constraints, not suggestions.** Each block type carries a contract: required elements, layout rules, anti-patterns, and hard P0 checks. The agent validates its own output before showing it to you.
- **Determinism over improvisation.** A bounded design system token set (colors, typography, spacing) replaces freestyle improvisation.
- **Canonical execution.** Once a block reaches `ready`, the agent is expected to call `execute_craft_ready`. That recomputes the semantic `render_tree`, applies critique and preflight lint, then dispatches the canonical renderer path.

---

## How it works

```
/craft "landing page for my SaaS"
  │
  ├─ Agent asks: Who's the user? What's the tone? Any brand constraints?
  │
  ├─ Agent asks: What's the hero's single action? Established product or pre-launch?
  │
  ├─ Agent presents 3 visual directions — you pick one by feel:
  │     • Focused & Calm  (Linear / Vercel)
  │     • Warm Editorial  (Notion)
  │     • Data-Dense Pro  (PostHog / ClickHouse)
  │
  ├─ Agent shows a plain-language preview: "A centered hero, one headline,
  │   one button. No subheadline. Generous space. Focused & Calm feel."
  │
  ├─ You say "design it" → agent executes using real design tokens + constraints
  │
  ├─ Agent self-validates against the block's checklist (P0 checks, anti-patterns)
  │
  └─ You approve → DESIGN.md is written → run /craft again for the next block
```

State is written to `DESIGN.md` in your project root after each block. Resuming a half-finished design is a single `/craft` invocation — no re-explaining. If `DESIGN.md` clearly belongs to a different goal than the current request, Craft restarts cleanly instead of muddying the active block state.

---

## Installation

### 1. Clone and build

```bash
git clone https://github.com/leoengithub/craft-design-mcp.git
cd craft-design-mcp
pnpm install
pnpm build
```

### 2. Add to your MCP client

**Claude Code** — add to `.claude/mcp.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "craft-design": {
      "command": "node",
      "args": ["/absolute/path/to/craft-design-mcp/dist/index.js"]
    }
  }
}
```

**Cursor** — add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "craft-design": {
      "command": "node",
      "args": ["/absolute/path/to/craft-design-mcp/dist/index.js"]
    }
  }
}
```

---

## Usage

### `/craft` — start or resume a design session

```
/craft "landing page for a developer analytics tool"
/craft "pricing page with 3 tiers"
/craft "mobile app with home and profile screens"
/craft   ← resumes from DESIGN.md if one exists
```

The agent detects `DESIGN.md`, `COMPONENTS.md`, `craft-components.json`, and `craft-ds.md` in your project root automatically. Pass them to `start_craft` when invoking manually.

### `/craft-setup` — scaffold your brand tokens

Run this once in a project that already has a design system. The agent will:

1. Read your Tailwind config, CSS variables, or theme file
2. Extract colors, typography, and spacing into `craft-ds.md`
3. Scan your components folder and list reusable components in `COMPONENTS.md`
4. Generate semantic mappings for those components in `craft-components.json`

After setup, `/craft` will offer **Your Brand** as a fourth direction option and reuse existing components instead of rebuilding them.

---

## Block library (15 skills)

| Block | Scenario | Key constraint |
|-------|----------|----------------|
| `hero-section` | Web | One CTA only |
| `navigation` | Web + Mobile | ≤6 top-level items, no hamburger on desktop |
| `feature-highlights` | Web | ≤6 cards, benefit language only, no invented metrics |
| `pricing-row` | Web | ≤3 tiers, ≤8 features/tier, no placeholder features |
| `footer` | Web | Utility only — no marketing copy |
| `data-table` | Web + Mobile | ≤8 columns, empty state required |
| `kpi-summary` | Web + Mobile | ≤6 metrics, delta must include reference period |
| `onboarding-step` | Web + Mobile | One decision per step, ≤3 fields |
| `form` | Web + Mobile | Single column, no placeholder-as-label |
| `card-grid` | Web + Mobile | ≤4 columns, consistent card structure |
| `modal` | Web + Mobile | One primary action, always dismissible |
| `sidebar` | Web | ≤3 nesting levels, no icons without labels |
| `empty-state` | Web + Mobile | Always includes an action — never a dead end |
| `mobile-screen-header` | Mobile | ≤2 action icons, single-line title |
| `bottom-navigation` | Mobile | 3–5 tabs, icon + label always |

---

## Design system library (8 systems)

| System | Direction | Feel |
|--------|-----------|------|
| `linear` | Focused & Calm | Flat, indigo accent, Inter — the default for most products |
| `material-ui` | Focused & Calm / Data-Dense Pro | Roboto, app-first controls, standard dialogs/forms/toolbars |
| `vercel` | Focused & Calm | Dark-first, Geist typeface, terminal aesthetic |
| `stripe` | Focused & Calm | Navy + indigo, polished marketing |
| `shadcn` | Focused & Calm | Zinc gray, component-neutral baseline |
| `notion` | Warm Editorial | Warm whites, generous line-height, editorial feel |
| `posthog` | Data-Dense Pro | Dark, orange accent, tight density |
| `clickhouse` | Data-Dense Pro | Dark, yellow accent, SQL-native |

The agent does not need to guess blindly. If the codebase already points to a known library, `/craft` should pass that as `project_design_system` and recommend it first. If you want a different system, name it explicitly ("use Stripe's design system") and the agent should switch.

---

## Bringing your own brand

Drop a `craft-ds.md` in your project root (or run `/craft-setup` to generate one):

```markdown
---
craft:
  name:          custom
  label:         My Brand
  direction_fit: [focused-calm]
  version:       1.0.0
---

## Color
| Token   | Hex     | Description        |
|---------|---------|--------------------|
| primary | #FF4F00 | Brand orange — CTA |
| bg      | #FAFAFA | Page background    |
| text    | #111111 | Body text          |
| border  | #E5E5E5 | Dividers           |

## Typography
| Role    | Size  | Weight | Usage      |
|---------|-------|--------|------------|
| Display | 48px  | 700    | Headlines  |
| Body    | 16px  | 400    | Body text  |

Typeface: Söhne (fallback: Inter)

## Spacing
Base unit: 4px
Scale: 4 / 8 / 16 / 24 / 32 / 48 / 64

## Layout
- Max content width: 1280px

## Components
(describe your button, card, input styles)

## Motion
- Duration: 150ms, ease-out

## Voice
(describe your copy tone)

## Brand
(describe the feel in 2–3 sentences)

## Anti-patterns
- No gradients on buttons
- No drop shadows
```

When `/craft` detects `craft-ds.md`, it adds **Your Brand** as the first direction option.

---

## Reusing existing components

Drop a `COMPONENTS.md` in your project root (or let `/craft-setup` generate it):

```markdown
# Project Components

- Button — src/components/Button.tsx
- Card — src/components/Card.tsx
- Modal — src/components/Modal.tsx
- Input — src/components/Input.tsx
- Badge — src/components/Badge.tsx
```

The agent reads this on every `/craft` invocation and passes the component list to `craft_context`. It will reference these instead of building from scratch.

### Semantic component mappings

Drop a `craft-components.json` in your project root (or let `/craft-setup` generate it):

```json
{
  "components": [
    {
      "component_name": "Button",
      "source_path": "src/components/Button.tsx",
      "semantic_component_id": "button.primary",
      "variants": ["primary", "secondary"],
      "states": ["default"]
    }
  ]
}
```

This is the machine-readable bridge from your codebase library into the Craft semantic catalog. During resolution, Craft prefers:

1. project component mappings from `craft-components.json`
2. shipped Craft design system manifests
3. local reusable Figma components
4. materialized local Craft components
5. primitive fallback

If the project already uses a known library such as Material UI, `/craft` should detect that from the codebase, pass `project_design_system`, and recommend the matching Craft design system first instead of defaulting to a generic direction.

---

## Extending the library

### Adding a skill

1. Create `skills/<block-type>/SKILL.md` following the format in any existing skill
2. Create `skills/<block-type>/manifest.json` with semantic component preferences, required components, and critique rules
3. Fill all 8 sections: Purpose, Required elements, Layout rules, Component patterns, Anti-patterns, Self-critique checklist, Example prompts
4. Include at least 5 anti-patterns and 2 P0 checks
5. Restart the MCP server — the skill is immediately available

No code changes required.

### Adding a design system

1. Create `design-systems/<name>.md` following the format in any existing system
2. Create `design-systems/<name>.manifest.json` with component metadata and critique rules
3. Fill all 9 sections: Color (token table), Typography (role table + Typeface line), Spacing, Layout, Components, Motion, Voice, Brand, Anti-patterns
4. Set `direction_fit` to one or more of: `focused-calm`, `warm-editorial`, `data-dense-pro`
5. Restart the MCP server

No code changes required.

---

## Craft Bridge execution

For Figma workflows, `/craft` should not improvise renderer steps. The intended flow is:

1. `start_craft(...)`
2. repeated `continue_craft(...)`
3. once `phase === "ready"`, call `execute_craft_ready({ state })`

`execute_craft_ready` is the canonical Craft execution contract. It:

- rebuilds `craft_context`, `render_intent`, and the semantic `render_tree`
- resolves semantic nodes against your project mappings and Craft manifests
- runs critique rules from the selected skill and design system
- runs pre-render lint, including token validity and text contrast checks
- dispatches the primary renderer path (`render_tree` for Figma)

On the Figma side, the plugin should:

- materialize and reuse local text styles per design system and text role
- apply those styles instead of leaving typography as ad hoc node settings
- keep the bridge deterministic while the MCP owns taste and semantic selection
- use an explicit `Connect` / `Disconnect` handshake to bind the plugin to the current MCP instance instead of auto-connecting to any stale local bridge listener

The bridge should stay a deterministic executor. Taste and discipline are enforced on the MCP side.

---

## Architecture

The MCP is a pure state machine — it holds no server-side session memory. Every `continue_craft` call carries the full `CraftWorkflowState` forward. Every response returns the updated state. `DESIGN.md` in the project root is the durable record.

```
src/
  index.ts                  ← MCP server + prompts (/craft, /craft-setup)
  types.ts                  ← CraftWorkflowState, CraftContext, Direction
  tools/
    start-craft.ts          ← entry point, resume from DESIGN.md
    continue-craft.ts       ← workflow state machine (7 actions)
    validate-design.ts      ← constraint checker, P0 enforcement
    list-skills.ts          ← skill index (frontmatter only)
    list-design-systems.ts  ← system index (frontmatter only)
  skills/loader.ts          ← on-demand SKILL.md parser
  design-systems/loader.ts  ← on-demand DESIGN.md parser
skills/                     ← one folder per block type
design-systems/             ← one file per design system
```

---

## License

MIT
