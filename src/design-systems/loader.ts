import { readFile, readdir } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { DesignSystemTokens } from "../types.js"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..")

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

function extractTokens(content: string): DesignSystemTokens {
  // Minimal token extraction from color table rows
  const colorSection = content.match(/## Color[^\n]*\n([\s\S]+?)(?=\n## )/)?.[1] ?? ""
  const colors: Record<string, string> = {}
  for (const match of colorSection.matchAll(/\|\s*(\w+)\s*\|\s*(#[0-9A-Fa-f]{6})/g)) {
    colors[match[1].toLowerCase()] = match[2]
  }

  return {
    colors,
    typography: {
      display: { family: "Inter", weight: "600", sizes: ["48px", "40px"] },
      body: { family: "Inter", weight: "400", sizes: ["16px", "14px"] },
    },
    spacing: { base: 4, scale: [4, 8, 12, 16, 24, 32, 48, 64, 96] },
    radius: { sm: "4px", md: "8px", lg: "12px" },
    shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 12px rgba(0,0,0,0.08)" },
  }
}

function extractField(yaml: string, key: string): string | undefined {
  return yaml.match(new RegExp(`${key}:\\s*(.+)`))?.[1].trim()
}

function extractSection(content: string, heading: string): string[] {
  const match = content.match(new RegExp(`## ${heading}\\n([\\s\\S]+?)(?=\\n## |$)`))
  if (!match) return []
  return match[1].split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2).trim())
}
