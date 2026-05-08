---
craft:
  block_type:  pricing-row
  label:       Pricing Row
  scenario:    web
  description: Side-by-side plan comparison. Helps the user choose, not overwhelms them.
  version:     1.0.0
---

## Purpose
Pricing is a decision page. Every element either helps the user choose the right plan or creates friction. Less is more. The goal is one clear recommendation, not exhaustive feature comparison.

## Required elements
- 2–3 pricing tiers (rarely 4 — never more)
- Plan name per tier
- Price per tier (monthly, with annual toggle if offered)
- 4–8 key features per tier
- One CTA per tier
- Visual distinction for the recommended tier

## Layout rules
- Equal-width columns for each tier
- Recommended tier visually elevated (border, background fill, or shadow)
- Feature list aligned across tiers — same features in the same row for comparison
- Annual/monthly toggle above the columns
- Price typographically dominant

## Component patterns
- Recommended badge: "Most popular" or "Best value" — only on one tier
- Feature checkmarks: filled icon for included, empty or X for excluded
- Price: large numeral + smaller "/mo" or "/year" suffix
- CTA: full-width button within the card, same vertical position across all cards

## Anti-patterns
- "Most popular" badge on every tier
- More than 4 pricing tiers
- Feature lists longer than 8 items
- Hiding the free plan below the fold to push paid tiers
- Enterprise tier with no price and only "Contact sales"
- Price shown only annually when monthly is the default expectation

## Self-critique checklist
- [ ] Philosophy: Does the layout help the user choose, or does it overwhelm?
- [ ] Hierarchy: Is the recommended tier visually distinct? Is price the most prominent text?
- [ ] Specificity: Do the feature lists reflect actual features from the brief?
- [ ] Restraint: Are there 3 or fewer tiers? Feature lists 8 items or fewer?
- [ ] Completeness: Does each tier have a name, price, feature list, and CTA?
- [ ] P0: Maximum 3 tiers (4 only if explicitly required)
- [ ] P0: No placeholder features — every item must be real

## Example prompts
- "Pricing for a SaaS with Free, Pro ($29/mo), and Team ($99/mo) tiers"
- "Pricing row for an API product — usage-based with a flat starter tier"
