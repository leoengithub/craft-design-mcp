import type { CraftContext, CraftWorkflowState, PluginSpec, RenderBlockPlan, RenderIntent, RenderTreePlan } from "../types.js"
import { loadSkill } from "../skills/loader.js"
import { loadDesignSystem } from "../design-systems/loader.js"
import { buildRenderIntent } from "./render-intent.js"
import { buildRenderBlockPlan } from "./render-plan.js"
import { buildRenderTreePlan } from "./render-tree.js"
import { loadDesignSystemManifest, loadSkillManifest } from "../semantic/manifest-loader.js"
import { resolveRenderTreePlan } from "../semantic/resolver.js"
import { critiqueResolvedRenderTree } from "../semantic/critique.js"
import { lintResolvedRenderTree } from "../semantic/preflight.js"
import { inferMode } from "./infer-mode.js"

export interface PreparedReadyArtifacts {
  craftContext: CraftContext
  pluginSpec: PluginSpec
  renderIntent: RenderIntent
  renderPlan: RenderBlockPlan
  renderTree: RenderTreePlan
  critiqueFindings: string[]
  preflightFindings: string[]
}

export async function prepareReadyArtifacts(state: CraftWorkflowState): Promise<PreparedReadyArtifacts> {
  const block = state.current_block ?? ""
  if (!state.direction) {
    throw new Error("Cannot prepare execution without a chosen direction")
  }

  const skill = await loadSkill(block)
  const blockDef = state.block_definitions[block] ?? {}
  const designSystemName = state.direction.design_system
  const system = designSystemName === "custom"
    ? undefined
    : await loadDesignSystem(designSystemName)
  const tokens = designSystemName === "custom" && state.custom_design_system
    ? state.custom_design_system.tokens
    : system?.tokens ?? (await loadDesignSystem("linear")).tokens
  const designSystemAntiPatterns = designSystemName === "custom"
    ? state.custom_design_system?.anti_patterns ?? []
    : system?.anti_patterns ?? []

  const mode = inferMode(state.goal, block, state.direction.id)

  const craftContext: CraftContext = {
    block,
    parent_goal: state.goal,
    mode,
    brief: {
      primary_action: blockDef.primary_action ?? "",
      audience: state.project_context?.audience,
      tone: state.project_context?.tone,
      notes: blockDef.notes,
    },
    direction: state.direction,
    tokens,
    constraints: {
      layout_rules: skill.layout_rules,
      component_patterns: skill.component_patterns,
      anti_patterns: [
        ...skill.anti_patterns,
        ...designSystemAntiPatterns,
      ],
    },
    design_md_snapshot: state.design_md,
    existing_components: state.existing_components,
  }

  const pluginSpec: PluginSpec = {
    version: "1",
    mode,
    block,
    goal: state.goal,
    direction: state.direction,
    tokens,
    brief: craftContext.brief,
    platform: state.project_context?.platform ?? "web",
    constraints: craftContext.constraints,
    existing_components: state.existing_components,
  }

  const renderIntent = buildRenderIntent(state, craftContext)
  const renderPlan = buildRenderBlockPlan(state, craftContext)
  const unresolvedTree = buildRenderTreePlan(state, craftContext)
  const designSystemManifest = await loadDesignSystemManifest(designSystemName === "custom" ? "linear" : designSystemName)
  const skillManifest = await loadSkillManifest(block)
  const resolvedTree = resolveRenderTreePlan(unresolvedTree, {
    componentMappings: state.component_mappings,
    designSystemManifest,
    skillManifest,
  })
  const critique = critiqueResolvedRenderTree(resolvedTree, { designSystemManifest, skillManifest })
  const preflight = lintResolvedRenderTree(critique.plan, { designSystemManifest, skillManifest })

  return {
    craftContext,
    pluginSpec,
    renderIntent,
    renderPlan,
    renderTree: preflight.plan,
    critiqueFindings: critique.findings,
    preflightFindings: preflight.findings,
  }
}
