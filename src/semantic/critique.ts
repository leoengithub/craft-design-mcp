import type { DesignSystemManifest, RenderTreeNode, RenderTreePlan, SkillManifest } from "../types.js"

interface CritiqueResult {
  plan: RenderTreePlan
  findings: string[]
}

interface CritiqueOptions {
  designSystemManifest: DesignSystemManifest
  skillManifest: SkillManifest
}

export function critiqueResolvedRenderTree(plan: RenderTreePlan, options: CritiqueOptions): CritiqueResult {
  const findings: string[] = []
  const root = rewriteNode(plan.root, findings, true)
  applyManifestChecks(root, findings, options)
  return {
    plan: { ...plan, root },
    findings,
  }
}

function rewriteNode(node: RenderTreeNode, findings: string[], isRoot = false): RenderTreeNode {
  switch (node.kind) {
    case "stack": {
      let primaryAssigned = false
      const children = node.children.map((child) => {
        const rewritten = rewriteNode(child, findings)
        if (rewritten.kind === "button" && rewritten.variant === "primary") {
          if (primaryAssigned) {
            findings.push(`Demoted extra primary action "${rewritten.label}" to secondary.`)
            return {
              ...rewritten,
              variant: "secondary" as const,
              semantic: { ...rewritten.semantic, component_id: "button.secondary", variant: "secondary" },
            }
          }
          primaryAssigned = true
        }
        return rewritten
      })
      let next = { ...node, children }

      if (node.semantic?.component_id === "banner.feedback" && !node.fill) {
        findings.push("Applied banner surface treatment to feedback banner.")
        next = { ...next, fill: "#FFFFFF", stroke: "#E5E7EB", radius: node.radius ?? 12, padding: node.padding ?? 20 }
      }

      if (node.semantic?.component_id === "surface.card" && !node.fill) {
        findings.push(`Applied card surface treatment to "${node.name}".`)
        next = { ...next, fill: "#FFFFFF", stroke: "#E5E7EB", radius: node.radius ?? 12, padding: node.padding ?? 20 }
      }

      if (isRoot && !node.semantic) {
        findings.push("Root node had no semantic component. Kept primitive root, but this should be reduced over time.")
      }

      return next
    }

    case "button": {
      if (node.variant === "ghost" && node.semantic?.component_id === "button.primary") {
        findings.push(`Promoted "${node.label}" from ghost to primary CTA.`)
        return { ...node, variant: "primary", semantic: { ...node.semantic, component_id: "button.primary", variant: "primary" } }
      }
      return node
    }

    default:
      return node
  }
}

function applyManifestChecks(root: RenderTreeNode, findings: string[], options: CritiqueOptions) {
  const usedComponents = collectSemanticComponents(root)
  const usedPrimitiveResolutions = countPrimitiveResolutions(root)

  if (options.skillManifest.root_component_id && root.semantic?.component_id !== options.skillManifest.root_component_id) {
    findings.push(`Root semantic component drifted from "${options.skillManifest.root_component_id}" to "${root.semantic?.component_id ?? "none"}".`)
  }

  for (const required of options.skillManifest.required_components) {
    if (!usedComponents.has(required)) {
      findings.push(`Required semantic component "${required}" is missing from the resolved tree.`)
    }
  }

  if (root.resolution?.source === "primitive") {
    findings.push(`Root component "${root.semantic?.component_id ?? root.kind}" fell back to primitive resolution.`)
  }

  if (usedPrimitiveResolutions > 2) {
    findings.push(`Resolved tree still relies on ${usedPrimitiveResolutions} primitive fallbacks.`)
  }

  const allowedComponents = new Set(options.designSystemManifest.components.map((component) => component.semantic_component_id))
  for (const componentId of usedComponents) {
    if (!allowedComponents.has(componentId)) {
      findings.push(`Semantic component "${componentId}" is not described by the selected design system manifest.`)
    }
  }
}

function collectSemanticComponents(node: RenderTreeNode, acc = new Set<string>()): Set<string> {
  if (node.semantic?.component_id) {
    acc.add(node.semantic.component_id)
  }
  if (node.kind === "stack") {
    for (const child of node.children) {
      collectSemanticComponents(child, acc)
    }
  }
  return acc
}

function countPrimitiveResolutions(node: RenderTreeNode): number {
  let total = node.resolution?.source === "primitive" ? 1 : 0
  if (node.kind === "stack") {
    for (const child of node.children) {
      total += countPrimitiveResolutions(child)
    }
  }
  return total
}
