import type { CraftContext, CraftWorkflowState, RenderIntent } from "../types.js"

export function buildRenderIntent(state: CraftWorkflowState, craftContext: CraftContext): RenderIntent {
  const block = craftContext.block
  const primaryAction = craftContext.brief.primary_action

  return {
    artifact_name: humanizeArtifactName(block),
    renderer: state.execution?.renderer ?? "code",
    surface_kind: classifySurfaceKind(state.goal, block),
    target_context: state.execution?.figma_session_id
      ? { file_session_id: state.execution.figma_session_id }
      : undefined,
    content: {
      block_tree: [{
        id: block,
        kind: block,
        purpose: primaryAction || state.goal,
        content: {
          primary_action: primaryAction,
          notes: craftContext.brief.notes ?? [],
        },
      }],
      primary_action: primaryAction,
    },
    style: {
      tone: craftContext.brief.tone,
      density: inferDensity(craftContext),
      platform: state.project_context?.platform ?? "web",
    },
    design_system: {
      source: "craft",
      tokens: Object.keys(craftContext.tokens.colors),
      component_preferences: craftContext.constraints.component_patterns,
      anti_patterns: craftContext.constraints.anti_patterns,
    },
    execution: {
      auto_run: state.execution?.renderer === "figma",
      reuse_existing_assets: true,
      materialize_missing_assets: true,
      persist_generated_assets: true,
    },
  }
}

function classifySurfaceKind(goal: string, block: string): RenderIntent["surface_kind"] {
  const haystack = `${goal} ${block}`.toLowerCase()
  if (/(landing|marketing|hero|pricing|homepage|site)/.test(haystack)) return "marketing"
  if (/(dashboard|analytics|table|kpi|admin)/.test(haystack)) return "dashboard"
  if (/(settings|preferences|configuration)/.test(haystack)) return "settings"
  if (/(auth|login|sign in|signup|register|onboarding)/.test(haystack)) return "auth"
  if (/(article|docs|content|editorial|blog)/.test(haystack)) return "content"
  if (/(app|workspace|screen|sidebar|form|modal)/.test(haystack)) return "application"
  return "custom"
}

function inferDensity(craftContext: CraftContext): RenderIntent["style"]["density"] {
  if (craftContext.mode === "free") return "spacious"
  if (craftContext.block === "data-table") return "compact"
  return "balanced"
}

function humanizeArtifactName(block: string): string {
  return block
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
