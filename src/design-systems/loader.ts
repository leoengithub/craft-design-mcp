import { readFile, readdir } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { DesignSystemTokens } from "../types.js"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")

interface SystemMeta {
  name: string
  label: string
  reference: string
  direction_fit: string[]
}

interface DesignSystem {
  name: string
  label: string
  reference: string
  tokens: DesignSystemTokens
  anti_patterns: string[]
}

let systemIndex: SystemMeta[] | null = null

export async function getDesignSystemIndex(): Promise<SystemMeta[]> {
  if (systemIndex) return systemIndex

  const dir = join(ROOT, "design-systems")
  const entries = await readdir(dir)
  const metas: SystemMeta[] = []

  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue
    try {
      const content = await readFile(join(dir, entry), "utf-8")
      const meta = parseFrontmatter(content)
      if (meta) metas.push(meta)
    } catch {
      // Skip missing or malformed files
    }
  }

  systemIndex = metas
  return metas
}

export async function loadDesignSystem(name: string): Promise<DesignSystem> {
  const path = join(ROOT, "design-systems", `${name}.md`)
  const content = await readFile(path, "utf-8")
  return parseSystem(name, content)
}

function parseFrontmatter(content: string): SystemMeta | null {
  const match = content.match(/^---\n([\s\S]+?)\n---/)
  if (!match) return null
  const yaml = match[1]
  const directionFit = yaml.match(/direction_fit:\s*\[([^\]]+)\]/)?.[1]
    .split(",").map(s => s.trim().replace(/['"]/g, "")) ?? []
  return {
    name: extractField(yaml, "name") ?? "",
    label: extractField(yaml, "label") ?? "",
    reference: extractField(yaml, "reference") ?? "",
    direction_fit: directionFit,
  }
}

function parseSystem(name: string, content: string): DesignSystem {
  const front = content.match(/^---\n([\s\S]+?)\n---/)?.[1] ?? ""
  return {
    name,
    label: extractField(front, "label") ?? name,
    reference: extractField(front, "reference") ?? "",
    tokens: extractTokens(content),
    anti_patterns: extractSection(content, "Anti-patterns"),
  }
}

// Exported for use by start_craft when parsing craft-ds.md.
export function parseCustomDesignSystem(content: string): { tokens: DesignSystemTokens; anti_patterns: string[] } {
  return {
    tokens: extractTokens(content),
    anti_patterns: extractSection(content, "Anti-patterns"),
  }
}

function extractTokens(content: string): DesignSystemTokens {
  return {
    colors: extractColors(content),
    typography: extractTypography(content),
    spacing: extractSpacing(content),
    radius: extractRadius(content),
    shadows: {},
  }
}

function extractColors(content: string): Record<string, string> {
  const section = content.match(/## Color[^\n]*\n([\s\S]+?)(?=\n## )/)?.[1] ?? ""
  const colors: Record<string, string> = {}
  for (const match of section.matchAll(/\|\s*([\w-]+)\s*\|\s*(#[0-9A-Fa-f]{6})/g)) {
    colors[match[1].toLowerCase()] = match[2]
  }
  return colors
}

function extractTypography(content: string): DesignSystemTokens["typography"] {
  const section = content.match(/## Typography\n([\s\S]+?)(?=\n## )/)?.[1] ?? ""

  const typeface = section.match(/Typeface:\s*([^\n(,]+)/)?.[1].trim() ?? "Inter"

  // Parse role table: | Role | Size | Weight | Usage |
  const rows: Record<string, { size: string; weight: string }> = {}
  for (const m of section.matchAll(/\|\s*([A-Za-z]+)\s*\|\s*(\d+px)\s*\|\s*(\d+)\s*\|/g)) {
    rows[m[1].toLowerCase()] = { size: m[2], weight: m[3] }
  }

  const display = rows["display"] ?? { size: "48px", weight: "600" }
  const headline = rows["headline"] ?? { size: "32px", weight: "600" }
  const body = rows["body"] ?? { size: "16px", weight: "400" }
  const secondary = rows["secondary"] ?? { size: "14px", weight: "400" }
  const mono = rows["mono"]

  return {
    display: { family: typeface, weight: display.weight, sizes: [display.size, headline.size] },
    body: { family: typeface, weight: body.weight, sizes: [body.size, secondary.size] },
    ...(mono ? { mono: { family: typeface } } : {}),
  }
}

function extractSpacing(content: string): DesignSystemTokens["spacing"] {
  const section = content.match(/## Spacing\n([\s\S]+?)(?=\n## )/)?.[1] ?? ""
  const base = parseInt(section.match(/Base unit:\s*(\d+)/)?.[1] ?? "4")
  const scaleStr = section.match(/Scale:\s*([\d /]+)/)?.[1] ?? ""
  const scale = scaleStr.split("/").map(s => parseInt(s.trim())).filter(n => !isNaN(n))
  return { base, scale: scale.length ? scale : [4, 8, 12, 16, 24, 32, 48, 64, 96] }
}

function extractRadius(content: string): Record<string, string> {
  const section = content.match(/## Components\n([\s\S]+?)(?=\n## )/)?.[1] ?? ""
  const radius: Record<string, string> = {}
  for (const m of section.matchAll(/(\w+)s?:.*?(\d+)px radius/g)) {
    radius[m[1].toLowerCase()] = `${m[2]}px`
  }
  if (!radius.card) radius.card = "8px"
  if (!radius.button) radius.button = "6px"
  if (!radius.input) radius.input = "6px"
  return radius
}

function extractField(yaml: string, key: string): string | undefined {
  return yaml.match(new RegExp(`${key}:\\s*(.+)`))?.[1].trim()
}

function extractSection(content: string, heading: string): string[] {
  const match = content.match(new RegExp(`## ${heading}\\n([\\s\\S]+?)(?=\\n## |$)`))
  if (!match) return []
  return match[1].split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2).trim())
}
