import type { DesignSystemManifest, RenderTreeNode, RenderTreePlan, SkillManifest } from "../types.js"

interface PreflightOptions {
  designSystemManifest: DesignSystemManifest
  skillManifest: SkillManifest
}

interface PreflightResult {
  plan: RenderTreePlan
  findings: string[]
}

export function lintResolvedRenderTree(plan: RenderTreePlan, options: PreflightOptions): PreflightResult {
  const findings: string[] = []
  const root = lintNode(plan.root, plan.palette.bg, plan.palette, findings)

  const allowedComponents = new Set(options.designSystemManifest.components.map((component) => component.semantic_component_id))
  const usedComponents = collectSemanticComponents(root)

  for (const componentId of usedComponents) {
    if (!allowedComponents.has(componentId)) {
      findings.push(`Semantic component "${componentId}" is outside the selected design system manifest and may require local materialization.`)
    }
  }

  for (const preferred of options.skillManifest.preferred_components) {
    if (usedComponents.has(preferred)) continue
    findings.push(`Preferred semantic component "${preferred}" was not used in the resolved tree.`)
  }

  return {
    plan: { ...plan, root },
    findings,
  }
}

function lintNode(
  node: RenderTreeNode,
  background: string,
  palette: RenderTreePlan["palette"],
  findings: string[],
): RenderTreeNode {
  switch (node.kind) {
    case "stack": {
      const fill = normalizeColor(node.fill) ?? node.fill
      const nextBackground = fill ?? background
      const children = node.children.map((child) => lintNode(child, nextBackground, palette, findings))
      return {
        ...node,
        fill: fill ?? node.fill,
        stroke: normalizeColor(node.stroke) ?? node.stroke,
        children,
      }
    }

    case "text": {
      const defaultColor = defaultColorForRole(node.role, palette)
      const chosenColor = normalizeColor(node.color) ?? defaultColor
      const minContrast = node.role === "body" || node.role === "caption" ? 4.5 : 3
      if (contrastRatio(chosenColor, background) >= minContrast) {
        return {
          ...node,
          color: chosenColor === defaultColor ? node.color : chosenColor,
        }
      }

      const fallbackColor = pickReadableTextColor(background, palette, minContrast)
      if (fallbackColor !== chosenColor) {
        findings.push(`Raised contrast for "${truncate(node.text)}" against ${background}.`)
        return {
          ...node,
          color: fallbackColor,
        }
      }

      findings.push(`Text "${truncate(node.text)}" may still be low-contrast against ${background}.`)
      return {
        ...node,
        color: chosenColor,
      }
    }

    default:
      return node
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

function defaultColorForRole(
  role: Extract<RenderTreeNode, { kind: "text" }>["role"],
  palette: RenderTreePlan["palette"],
): string {
  return role === "caption" || role === "body" ? palette.muted : palette.text
}

function pickReadableTextColor(
  background: string,
  palette: RenderTreePlan["palette"],
  minContrast: number,
): string {
  const candidates = [palette.text, palette.primary, "#111111", "#FFFFFF", palette.muted]
    .map((value) => normalizeColor(value))
    .filter((value): value is string => Boolean(value))

  for (const candidate of candidates) {
    if (contrastRatio(candidate, background) >= minContrast) return candidate
  }
  return palette.text
}

function normalizeColor(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized.toUpperCase()
  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    const hex = normalized.slice(1)
    return `#${hex.split("").map((char) => char + char).join("").toUpperCase()}`
  }
  return undefined
}

function contrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  if (!fg || !bg) return 1
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function hexToRgb(value: string): { r: number; g: number; b: number } | undefined {
  const normalized = normalizeColor(value)
  if (!normalized) return undefined
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function truncate(value: string): string {
  return value.length > 48 ? `${value.slice(0, 45)}...` : value
}
