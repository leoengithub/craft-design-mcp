---
craft:
  block_type:  empty-state
  label:       Empty State
  scenario:    both
  description: The view shown when a list, table, or section has no content. Always actionable — never a dead end.
  version:     1.0.0
---

## Purpose
An empty state is an opportunity. When users arrive at a blank table, an empty inbox, or a project with no tasks, the product can either leave them stranded or guide them toward the first meaningful action. A good empty state explains why it's empty and tells the user exactly what to do next.

## Required elements
- A headline: what is empty and why (or just what to do)
- A short description (1–2 sentences max): context or benefit of filling this space
- A primary CTA: the action that will make this state non-empty
- Optional: a small illustration, icon, or graphic (supporting, not decorative)

## Layout rules
- Vertically and horizontally centered within its container
- Headline, description, and CTA stacked in a single column — no sidebars or two-column layouts
- Maximum content width: 400px — keep it focused
- The illustration or icon (if present) appears above the headline
- The CTA is the last element — nothing after it

## Component patterns
- Illustration/icon: 48–80px, muted color or brand accent, simple — no detailed scenes
- Headline: Subheadline or Headline size, bold, primary text color
- Description: Body size, muted color, centered text is acceptable here (exception to left-align rule)
- Primary CTA: same button style as the page's primary button; specific label
- Optional secondary link: "Learn more" or "Import from X" as a text link below the button

## Anti-patterns
- An empty state with no action — always provide a clear next step
- Vague descriptions: "Nothing here yet" — explain what belongs here and how to add it
- Error copy in a neutral empty state: "No results found" for an empty inbox implies the user searched and failed
- Decorative illustration that takes more space than the text and CTA
- Two primary action buttons — pick one
- Hiding the empty state behind a spinner that resolves to nothing
- Using a generic "empty box" icon for every empty state in the product — differentiate them

## Self-critique checklist
- [ ] Philosophy: Does the empty state guide the user toward a specific action, not just inform?
- [ ] Hierarchy: Is the headline the most prominent text? Is the CTA clearly at the bottom?
- [ ] Specificity: Does the headline and CTA reflect the actual empty context from the brief?
- [ ] Restraint: Is the illustration (if any) secondary to the text? Is there exactly one primary CTA?
- [ ] Completeness: Is there a headline, description, and CTA? Is the layout centered?
- [ ] P0: Every empty state must include at least one actionable CTA — no dead ends
- [ ] P0: Headline must describe what is empty and/or what to do — not a generic "Nothing here"

## Example prompts
- "Empty state for an issues list: no issues yet, CTA to create the first one"
- "Empty inbox state: no notifications, with a reassuring message and link to project settings"
- "Empty team members table: invite the first team member as the primary CTA"
