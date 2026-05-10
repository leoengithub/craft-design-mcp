import { describe, expect, it } from "vitest"
import type { ComponentMapping, DesignSystemManifest, RenderTreePlan, SkillManifest } from "../types.js"
import { loadDesignSystemManifest, loadSkillManifest } from "./manifest-loader.js"
import { critiqueResolvedRenderTree } from "./critique.js"
import { resolveRenderTreePlan } from "./resolver.js"

describe("semantic manifests", () => {
  it("loads a shipped design system manifest", async () => {
    const manifest = await loadDesignSystemManifest("linear")
    expect(manifest.components.some((component) => component.semantic_component_id === "navigation.primary")).toBe(true)
  })

  it("loads a shipped skill manifest", async () => {
    const manifest = await loadSkillManifest("navigation")
    expect(manifest.root_component_id).toBe("navigation.primary")
  })
})

describe("semantic resolution", () => {
  it("prefers codebase mappings over shipped design system components", () => {
    const plan = basePlan({
      kind: "button",
      label: "Save",
      variant: "primary",
      semantic: { component_id: "button.primary", variant: "primary" },
    })

    const resolved = resolveRenderTreePlan(plan, {
      componentMappings: [{
        component_name: "Button",
        source_path: "src/components/Button.tsx",
        semantic_component_id: "button.primary",
        variants: ["primary"],
      }],
      designSystemManifest: baseDesignSystemManifest(),
      skillManifest: baseSkillManifest(),
    })

    expect(resolved.root.resolution?.source).toBe("codebase")
    expect(resolved.root.resolution?.target_name).toBe("Button")
  })

  it("falls back to shipped design system components when no codebase mapping exists", () => {
    const plan = basePlan({
      kind: "button",
      label: "Save",
      variant: "primary",
      semantic: { component_id: "button.primary", variant: "primary" },
    })

    const resolved = resolveRenderTreePlan(plan, {
      componentMappings: [],
      designSystemManifest: baseDesignSystemManifest(),
      skillManifest: baseSkillManifest(),
    })

    expect(resolved.root.resolution?.source).toBe("craft_ds")
  })

  it("requests local materialization when no mapping or shipped component exists", () => {
    const plan = basePlan({
      kind: "stack",
      name: "Card",
      direction: "VERTICAL",
      children: [],
      semantic: { component_id: "surface.card", variant: "default", allow_fallback: true },
    })

    const resolved = resolveRenderTreePlan(plan, {
      componentMappings: [],
      designSystemManifest: { name: "empty", label: "Empty", components: [], critique_rules: [] },
      skillManifest: baseSkillManifest(),
    })

    expect(resolved.root.resolution?.source).toBe("materialized_local")
  })

  it("falls back to primitive when fallback is disallowed", () => {
    const plan = basePlan({
      kind: "stack",
      name: "Card",
      direction: "VERTICAL",
      children: [],
      semantic: { component_id: "surface.card", variant: "default", allow_fallback: false },
    })

    const resolved = resolveRenderTreePlan(plan, {
      componentMappings: [],
      designSystemManifest: { name: "empty", label: "Empty", components: [], critique_rules: [] },
      skillManifest: baseSkillManifest(),
    })

    expect(resolved.root.resolution?.source).toBe("primitive")
  })
})

describe("semantic critique", () => {
  it("adds surface treatment to a semantic feedback banner missing fills", () => {
    const plan = basePlan({
      kind: "stack",
      name: "Banner",
      direction: "HORIZONTAL",
      children: [],
      semantic: { component_id: "banner.feedback", variant: "default" },
      resolution: {
        semantic_component_id: "banner.feedback",
        source: "craft_ds",
        target_name: "Banner / Feedback",
        allow_fallback: true,
      },
    })

    const critique = critiqueResolvedRenderTree(plan, {
      designSystemManifest: {
        name: "linear",
        label: "Linear",
        components: [{
          semantic_component_id: "banner.feedback",
          label: "Banner / Feedback",
        }],
        critique_rules: [],
      },
      skillManifest: {
        block_type: "feedback",
        root_component_id: "banner.feedback",
        preferred_components: ["banner.feedback"],
        required_components: ["banner.feedback"],
        critique_rules: [],
      },
    })
    expect(critique.findings.length).toBeGreaterThan(0)
    expect(critique.plan.root.kind).toBe("stack")
    if (critique.plan.root.kind !== "stack") {
      throw new Error("expected stack root")
    }
    expect(critique.plan.root.fill).toBe("#FFFFFF")
  })
})

function basePlan(root: RenderTreePlan["root"]): RenderTreePlan {
  return {
    artifact_name: "Test Artifact",
    asset_section_name: "Craft / Assets / Test Artifact",
    goal: "Test",
    block: "navigation",
    platform: "web",
    tokens: {
      colors: {
        primary: "#5E6AD2",
        bg: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#111111",
        muted: "#6B7280",
        border: "#E5E7EB",
      },
      typography: {
        display: { family: "Inter", weight: "600", sizes: ["48px", "32px"] },
        body: { family: "Inter", weight: "400", sizes: ["16px", "14px"] },
      },
      spacing: { base: 4, scale: [4, 8, 12, 16, 24, 32] },
      radius: { card: "12px", button: "8px" },
      shadows: {},
    },
    palette: {
      primary: "#5E6AD2",
      bg: "#FFFFFF",
      surface: "#FFFFFF",
      text: "#111111",
      muted: "#6B7280",
      border: "#E5E7EB",
    },
    root,
  }
}

function baseDesignSystemManifest(): DesignSystemManifest {
  return {
    name: "linear",
    label: "Linear",
    components: [
      {
        semantic_component_id: "button.primary",
        label: "Button / Primary",
        variants: ["primary"],
      },
    ],
    critique_rules: [],
  }
}

function baseSkillManifest(): SkillManifest {
  return {
    block_type: "navigation",
    root_component_id: "navigation.primary",
    preferred_components: ["navigation.primary", "button.primary"],
    required_components: ["navigation.primary"],
    critique_rules: [],
  }
}
