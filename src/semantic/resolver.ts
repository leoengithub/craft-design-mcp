import type {
  ComponentMapping,
  DesignSystemManifest,
  RenderTreeNode,
  RenderTreePlan,
  ResolvedComponentRef,
  ResolutionSource,
  SkillManifest,
} from "../types.js"

interface ResolverOptions {
  componentMappings?: ComponentMapping[]
  designSystemManifest: DesignSystemManifest
  skillManifest: SkillManifest
}

export function resolveRenderTreePlan(plan: RenderTreePlan, options: ResolverOptions): RenderTreePlan {
  const root = ensureRootSemantic(plan.root, options.skillManifest)
  return {
    ...plan,
    root: resolveNode(root, options),
  }
}

function resolveNode(node: RenderTreeNode, options: ResolverOptions): RenderTreeNode {
  const semantic = inferSemantic(node, options.skillManifest)
  const resolvedChildren = node.kind === "stack"
    ? node.children.map((child) => resolveNode(child, options))
    : undefined

  const resolved = semantic
    ? resolveSemantic(semantic.component_id, semantic.variant, semantic.state, semantic.allow_fallback ?? true, options.componentMappings, options.designSystemManifest)
    : undefined

  if (node.kind === "stack") {
    return {
      ...node,
      semantic,
      resolution: resolved,
      children: resolvedChildren ?? node.children,
    }
  }

  return {
    ...node,
    semantic,
    resolution: resolved,
  }
}

function ensureRootSemantic(root: RenderTreeNode, skillManifest: SkillManifest): RenderTreeNode {
  if (!skillManifest.root_component_id || root.semantic) return root
  return {
    ...root,
    semantic: {
      component_id: skillManifest.root_component_id,
      resolution_target: "auto",
      allow_fallback: true,
    },
  }
}

function inferSemantic(node: RenderTreeNode, skillManifest: SkillManifest): RenderTreeNode["semantic"] {
  if (node.semantic) return node.semantic

  switch (node.kind) {
    case "button":
      return {
        component_id: `button.${node.variant}`,
        variant: node.variant,
        resolution_target: "auto",
        allow_fallback: true,
        slots: { label: node.label },
      }
    case "badge":
      return {
        component_id: "surface.card",
        variant: "compact",
        resolution_target: "design_system",
        allow_fallback: true,
        slots: { label: node.label },
      }
    case "stack":
      if (skillManifest.preferred_components.includes("surface.card") && hasCardShape(node)) {
        return {
          component_id: "surface.card",
          variant: node.min_height && node.min_height < 200 ? "compact" : "default",
          resolution_target: "auto",
          allow_fallback: true,
        }
      }
      return undefined
    default:
      return undefined
  }
}

function resolveSemantic(
  componentId: string,
  variant: string | undefined,
  state: string | undefined,
  allowFallback: boolean,
  componentMappings: ComponentMapping[] | undefined,
  designSystemManifest: DesignSystemManifest,
): ResolvedComponentRef {
  const codebaseMatch = componentMappings?.find((mapping) => mapping.semantic_component_id === componentId)
  if (codebaseMatch) {
    return {
      semantic_component_id: componentId,
      source: "codebase",
      target_name: codebaseMatch.component_name,
      mapping_name: codebaseMatch.component_name,
      variant: variant ?? codebaseMatch.variants?.[0],
      state: state ?? codebaseMatch.states?.[0],
      allow_fallback: allowFallback,
    }
  }

  const designSystemMatch = designSystemManifest.components.find((component) => component.semantic_component_id === componentId)
  if (designSystemMatch) {
    return {
      semantic_component_id: componentId,
      source: "craft_ds",
      target_name: designSystemMatch.label,
      variant: variant ?? designSystemMatch.variants?.[0],
      state: state ?? designSystemMatch.states?.[0],
      allow_fallback: allowFallback,
    }
  }

  const source: ResolutionSource = allowFallback ? "materialized_local" : "primitive"
  return {
    semantic_component_id: componentId,
    source,
    target_name: componentId,
    variant,
    state,
    allow_fallback: allowFallback,
  }
}

function hasCardShape(node: Extract<RenderTreeNode, { kind: "stack" }>): boolean {
  return Boolean(node.fill || node.stroke || node.radius || node.padding)
}
