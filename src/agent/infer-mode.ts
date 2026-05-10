export function inferMode(goal: string, blockType: string, directionId: string): "free" | "structured" {
  const structuredBlocks = [
    "data-table", "form", "sidebar", "navigation", "kpi-summary",
    "onboarding-step", "bottom-navigation", "mobile-screen-header", "footer", "modal",
  ]
  if (structuredBlocks.includes(blockType)) return "structured"
  if (directionId === "data-dense-pro") return "structured"
  if (/\b(creative|campaign|editorial|portfolio|illustration|artistic|expressive|branding|magazine)\b/i.test(goal)) return "free"
  return "structured"
}
