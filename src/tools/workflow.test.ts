import { describe, expect, it } from "vitest"
import type { CraftWorkflowState } from "../types.js"
import { loadSkill } from "../skills/loader.js"
import { advance, getDirections } from "./continue-craft.js"
import { goalsClearlyDiffer, parseDesignMd } from "./start-craft.js"
import { checkP0Rule } from "./validate-design.js"

describe("craft workflow", () => {
  it("reconstructs a usable block plan when resuming after a completed in-progress block", () => {
    const state = parseDesignMd([
      "# Project Design Context",
      "",
      "## Goal",
      "Landing page for an analytics SaaS",
      "",
      "## Direction",
      "Focused & Calm",
      "",
      "## Design System",
      "linear",
      "",
      "### hero-section 🔄",
      "- Primary action: View docs",
      "",
      "### hero-section ✅",
      "",
    ].join("\n"), "resume")

    expect(state.goal).toBe("Landing page for an analytics SaaS")
    expect(state.block_plan).toEqual([
      { block: "hero-section", status: "completed" },
      { block: "navigation", status: "current" },
      { block: "feature-highlights", status: "pending" },
      { block: "pricing-row", status: "pending" },
      { block: "footer", status: "pending" },
    ])
    expect(state.current_block).toBe("navigation")
  })

  it("allows a loaded custom design system direction to be selected", async () => {
    const state = baseState({
      custom_design_system: {
        tokens: {
          colors: { primary: "#111111" },
          typography: {
            display: { family: "Inter", weight: "600", sizes: ["48px"] },
            body: { family: "Inter", weight: "400", sizes: ["16px"] },
          },
          spacing: { base: 4, scale: [4, 8, 16] },
          radius: { button: "6px" },
          shadows: {},
        },
        anti_patterns: ["No purple gradients"],
      },
    })

    const output = await advance(state, { type: "choose_direction", direction_id: "custom" })

    expect(output.state.direction).toMatchObject({
      id: "custom",
      design_system: "custom",
    })
    expect(output.design_preview).toContain("Your Brand")
  })

  it("prepends the detected project design system to direction choices", () => {
    const directions = getDirections(baseState({
      phase: "direction_choice",
      project_design_system: "material-ui",
    }))

    expect(directions[0]).toMatchObject({
      id: "project-material-ui",
      design_system: "material-ui",
    })
  })

  it("promotes only the first pending block after approval", async () => {
    const output = await advance(baseState({
      phase: "ready",
      block_plan: [
        { block: "hero-section", status: "current" },
        { block: "navigation", status: "pending" },
        { block: "pricing-row", status: "pending" },
      ],
      design_md: "### hero-section 🔄\n- Primary action: View docs\n",
    }), { type: "approve_block", block: "hero-section" })

    expect(output.state.block_plan).toEqual([
      { block: "hero-section", status: "completed" },
      { block: "navigation", status: "current" },
      { block: "pricing-row", status: "pending" },
    ])
    expect(output.state.current_block).toBe("navigation")
    expect(output.state.design_md).not.toContain("hero-section 🔄")
  })

  it("includes built-in design system anti-patterns in craft context", async () => {
    const output = await advance(baseState({
      direction: {
        id: "focused-calm",
        name: "Focused & Calm",
        design_system: "linear",
      },
    }), { type: "request_design" })

    expect(output.craft_context?.constraints.anti_patterns).toContain("Drop shadows on cards or buttons")
  })

  it("loads skills from the project root", async () => {
    await expect(loadSkill("hero-section")).resolves.toMatchObject({
      block_type: "hero-section",
    })
  })

  it("detects when DESIGN.md belongs to an unrelated goal", () => {
    expect(goalsClearlyDiffer("Toolbar for a dashboard", "Team card for an about page")).toBe(true)
    expect(goalsClearlyDiffer("Pricing page for a SaaS", "Landing page pricing tiers")).toBe(false)
  })
})

describe("P0 validation", () => {
  it("recognizes P0 rules used by newer skills", () => {
    expect(checkP0Rule("Maximum 8 columns — add a visibility toggle if more data exists", "A data table with 9 columns and an empty state")).toContain("maximum 8")
    expect(checkP0Rule("Step must include a progress indicator — users must know where they are in the flow", "An onboarding choice screen with option cards")).toContain("No progress indicator")
    expect(checkP0Rule("Always provide a dismiss mechanism — X button, Cancel, or both", "A modal with a title and one Save button")).toContain("No dismiss mechanism")
  })
})

function baseState(overrides: Partial<CraftWorkflowState> = {}): CraftWorkflowState {
  return {
    phase: "define_or_design",
    goal: "Hero for a developer API",
    block_plan: [{ block: "hero-section", status: "current" }],
    current_block: "hero-section",
    project_context: {
      audience: "developers",
      tone: "focused and calm",
    },
    direction: undefined,
    block_definitions: {
      "hero-section": {
        primary_action: "View docs",
        notes: [],
      },
    },
    design_md: "# Project Design Context\n",
    ...overrides,
  }
}
