import { readFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { DesignSystemManifest, SkillManifest } from "../types.js"
import { getSemanticComponentSpec, listSemanticComponents } from "./catalog.js"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")

export async function loadDesignSystemManifest(name: string): Promise<DesignSystemManifest> {
  const path = join(ROOT, "design-systems", `${name}.manifest.json`)
  try {
    const content = await readFile(path, "utf-8")
    return JSON.parse(content) as DesignSystemManifest
  } catch {
    return deriveDesignSystemManifest(name)
  }
}

export async function loadSkillManifest(blockType: string): Promise<SkillManifest> {
  const path = join(ROOT, "skills", blockType, "manifest.json")
  try {
    const content = await readFile(path, "utf-8")
    return JSON.parse(content) as SkillManifest
  } catch {
    return deriveSkillManifest(blockType)
  }
}

function deriveDesignSystemManifest(name: string): DesignSystemManifest {
  const ids = listSemanticComponents().map((component) => component.id)
  return {
    name,
    label: capitalize(name),
    components: ids.map((id) => ({
      semantic_component_id: id,
      label: id,
      variants: getSemanticComponentSpec(id)?.variants.map((variant) => variant.id) ?? [],
      states: getSemanticComponentSpec(id)?.states ?? [],
      preferred_tokens: getSemanticComponentSpec(id)?.required_tokens ?? [],
      composition_rules: getSemanticComponentSpec(id)?.composition_rules ?? [],
    })),
    critique_rules: [
      "Prefer catalog components before primitive composition.",
      "Stay within the design system token palette.",
    ],
  }
}

function deriveSkillManifest(blockType: string): SkillManifest {
  const rootByBlock: Record<string, string> = {
    navigation: "navigation.primary",
    "hero-section": "hero.section",
    form: "field.text",
    "data-table": "table.data",
    "empty-state": "empty-state.default",
    footer: "surface.card",
    sidebar: "navigation.primary",
    "pricing-row": "surface.card",
  }

  const preferredByBlock: Record<string, string[]> = {
    navigation: ["navigation.primary", "button.primary", "button.secondary"],
    "hero-section": ["hero.section", "button.primary", "surface.card"],
    form: ["field.text", "button.primary", "surface.card"],
    "data-table": ["table.data", "surface.card"],
    "empty-state": ["empty-state.default", "button.primary"],
    sidebar: ["navigation.primary", "surface.card"],
    footer: ["surface.card", "button.ghost"],
    "pricing-row": ["surface.card", "button.primary", "button.secondary"],
  }

  return {
    block_type: blockType,
    root_component_id: rootByBlock[blockType],
    preferred_components: preferredByBlock[blockType] ?? ["surface.card", "button.primary"],
    required_components: preferredByBlock[blockType] ?? [],
    critique_rules: [
      "Use the preferred semantic components before generic primitives.",
      "Primary action should resolve to a semantic button when applicable.",
    ],
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
