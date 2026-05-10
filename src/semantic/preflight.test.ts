import { describe, expect, it } from "vitest"
import { lintResolvedRenderTree } from "./preflight.js"
import type { RenderTreePlan } from "../types.js"

describe("semantic preflight", () => {
  it("raises low-contrast text before execution", () => {
    const plan: RenderTreePlan = {
      artifact_name: "Feedback bar",
      asset_section_name: "Craft / Assets / Feedback bar",
      goal: "Feedback bar with dismiss action",
      block: "toolbar",
      platform: "web",
      tokens: {
        colors: {},
        typography: {
          display: { family: "Inter", weight: "700", sizes: ["48px"] },
          body: { family: "Inter", weight: "400", sizes: ["16px"] },
        },
        spacing: { base: 4, scale: [4, 8, 16] },
        radius: {},
        shadows: {},
      },
      palette: {
        primary: "#4F46E5",
        bg: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#111111",
        muted: "#9CA3AF",
        border: "#E5E7EB",
      },
      root: {
        kind: "stack",
        name: "Root",
        direction: "VERTICAL",
        fill: "#FFFFFF",
        children: [
          {
            kind: "text",
            text: "Too light",
            role: "body",
            color: "#D1D5DB",
          },
        ],
      },
    }

    const result = lintResolvedRenderTree(plan, {
      designSystemManifest: { name: "linear", label: "Linear", components: [], critique_rules: [] },
      skillManifest: { block_type: "toolbar", preferred_components: [], required_components: [], critique_rules: [] },
    })

    const node = result.plan.root.kind === "stack" ? result.plan.root.children[0] : undefined
    expect(node && node.kind === "text" ? node.color : undefined).toBe("#111111")
    expect(result.findings.some((finding) => finding.includes("Raised contrast"))).toBe(true)
  })
})
