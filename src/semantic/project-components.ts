import type { ComponentMapping } from "../types.js"

export function parseCraftComponentsJson(content: string): ComponentMapping[] {
  const parsed = JSON.parse(content) as { components?: ComponentMapping[] } | ComponentMapping[]
  const mappings = Array.isArray(parsed) ? parsed : parsed.components ?? []
  return mappings.filter((mapping) => Boolean(mapping.component_name && mapping.semantic_component_id))
}
