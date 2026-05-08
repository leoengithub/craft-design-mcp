import { readFile, readdir } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")

interface SkillMeta {
  block_type: string
  label: string
  description: string
  scenario: "web" | "mobile" | "both"
}

export interface ChecklistItem {
  dimension: string
  text: string
  is_p0: boolean
}

interface Skill {
  block_type: string
  layout_rules: string[]
  component_patterns: string[]
  anti_patterns: string[]
  checklist: ChecklistItem[]
}

let skillIndex: SkillMeta[] | null = null

export async function getSkillIndex(): Promise<SkillMeta[]> {
  if (skillIndex) return skillIndex

  const skillsDir = join(ROOT, "skills")
  const entries = await readdir(skillsDir)
  const metas: SkillMeta[] = []

  for (const entry of entries) {
    const skillPath = join(skillsDir, entry, "SKILL.md")
    try {
      const content = await readFile(skillPath, "utf-8")
      const meta = parseFrontmatter(content)
      if (meta) metas.push(meta)
    } catch {
      // Skip missing or malformed files
    }
  }

  skillIndex = metas
  return metas
}

export async function loadSkill(blockType: string): Promise<Skill> {
  try {
    const skillPath = join(ROOT, "skills", blockType, "SKILL.md")
    const content = await readFile(skillPath, "utf-8")
    return parseSkill(blockType, content)
  } catch {
    return {
      block_type: blockType,
      layout_rules: [
        "Establish a clear visual hierarchy — most important element dominates",
        "Use consistent spacing throughout",
        "Group related elements visually",
      ],
      component_patterns: [
        "Use semantic HTML elements",
        "Apply the chosen design system's typography scale",
        "Keep interactive elements visually distinct",
      ],
      anti_patterns: [
        "Avoid orphaned elements with no visual relationship to the rest",
        "Don't mix more than two font sizes in a single row",
        "Avoid ambiguous CTAs — label should describe the outcome",
      ],
      checklist: [
        { dimension: "P0", text: "Primary action is immediately obvious", is_p0: true },
        { dimension: "P0", text: "Content hierarchy matches the user goal", is_p0: true },
        { dimension: "Layout", text: "Spacing is consistent and intentional", is_p0: false },
        { dimension: "Copy", text: "Labels and CTAs describe outcomes, not mechanics", is_p0: false },
      ],
    }
  }
}

function parseFrontmatter(content: string): SkillMeta | null {
  const match = content.match(/^---\n([\s\S]+?)\n---/)
  if (!match) return null
  const yaml = match[1]
  return {
    block_type: extractField(yaml, "block_type") ?? "",
    label: extractField(yaml, "label") ?? "",
    description: extractField(yaml, "description") ?? "",
    scenario: (extractField(yaml, "scenario") ?? "web") as SkillMeta["scenario"],
  }
}

function parseSkill(blockType: string, content: string): Skill {
  return {
    block_type: blockType,
    layout_rules: extractSection(content, "Layout rules"),
    component_patterns: extractSection(content, "Component patterns"),
    anti_patterns: extractSection(content, "Anti-patterns"),
    checklist: parseChecklist(content),
  }
}

function parseChecklist(content: string): ChecklistItem[] {
  const match = content.match(/## Self-critique checklist\n([\s\S]+?)(?=\n## |$)/)
  if (!match) return []
  return match[1]
    .split("\n")
    .filter(l => /^- \[ \]/.test(l))
    .map(l => {
      const text = l.slice(6).trim()
      const is_p0 = text.startsWith("P0:")
      const colonIdx = text.indexOf(":")
      const dimension = colonIdx !== -1 ? text.slice(0, colonIdx).trim() : "General"
      const body = colonIdx !== -1 ? text.slice(colonIdx + 1).trim() : text
      return { dimension, text: body, is_p0 }
    })
}

function extractField(yaml: string, key: string): string | undefined {
  const match = yaml.match(new RegExp(`${key}:\\s*(.+)`))
  return match?.[1].trim()
}

function extractSection(content: string, heading: string): string[] {
  const match = content.match(new RegExp(`## ${heading}\\n([\\s\\S]+?)(?=\\n## |$)`))
  if (!match) return []
  return match[1]
    .split("\n")
    .filter(l => l.startsWith("- "))
    .map(l => l.slice(2).trim())
}
