---
craft:
  block_type:  feature-highlights
  label:       Feature Highlights
  scenario:    web
  description: A grid of focused feature cards. Each card makes one claim about one benefit.
  version:     1.0.0
---

## Purpose
Feature highlights translate product capabilities into user benefits. Each card makes a single, specific claim — not a feature dump. The goal is not to list everything the product does, but to make the reader think "this solves my problem."

## Required elements
- 3–6 feature cards in a grid
- Each card: a short headline (the benefit, not the feature name) and a 1–2 sentence description
- Optional: a small icon or illustration per card (supporting, not decorative)
- No CTA — features inform; conversion happens elsewhere

## Layout rules
- 3-column grid for desktop, 2-column for tablet, 1-column for mobile
- Equal-width cards — no asymmetric feature spotlighting
- Card structure must be consistent across all cards (icon position, headline size, text length)
- Section has a heading above the grid: one sentence summarizing the benefit theme

## Component patterns
- Card icon: 24–32px, stroke or filled, consistent style across all cards
- Headline: Subheadline size, medium weight — the benefit statement, not the feature name
- Description: Body size, muted color, max 2 lines
- Card padding: generous — 24–32px on all sides
- No CTA button inside individual cards

## Anti-patterns
- Feature names as headlines ("Advanced Caching") — use benefit language ("Pages load instantly")
- More than 6 cards — forces hard prioritization
- Invented metrics: "10x faster", "50% more productive" without a source
- Mixed card structures (some with icons, some without)
- Nested bullets or sub-lists inside a card description
- Each card pointing to a different feature page via its own link
- Using this block to list pricing features — use pricing-row instead

## Self-critique checklist
- [ ] Philosophy: Does each headline describe a user benefit, not a feature name?
- [ ] Hierarchy: Is the section heading visible? Are all cards visually equal?
- [ ] Specificity: Are the benefit claims specific to this product's brief, not generic SaaS copy?
- [ ] Restraint: Are there ≤6 cards? Are descriptions ≤2 lines each?
- [ ] Completeness: Does every card have a headline and description? Is the grid layout consistent?
- [ ] P0: No invented metrics — every quantified claim must come from the brief
- [ ] P0: All cards use the same structure — no mixed layouts within the grid

## Example prompts
- "Feature highlights for a CI/CD tool — 4 features: fast builds, parallel runs, deployment previews, team dashboards"
- "6-feature grid for a writing assistant — focus on benefits: faster drafts, fewer rewrites, consistent tone"
- "Feature section for a B2B analytics product — 3 features aimed at data analysts"
