---
craft:
  block_type:  card-grid
  label:       Card Grid
  scenario:    both
  description: A uniform grid of cards displaying comparable items. Consistent structure, scannable at a glance.
  version:     1.0.0
---

## Purpose
A card grid lets users browse and compare a set of like items — blog posts, team members, product features, case studies. The key constraint: all cards must carry the same information in the same order. A grid of inconsistent cards is harder to scan than a list.

## Required elements
- A grid of 2–12 cards with consistent internal structure
- Each card: at minimum a headline and one supporting element (image, description, or metadata)
- Optional: section heading above the grid
- Optional: a filter or sort control above the grid (if the grid is browsable)

## Layout rules
- Maximum 4 columns on desktop; 2 on tablet; 1 on mobile
- All cards in the same grid must have identical structure — same elements in the same order
- Card height: allow natural height variation by content, but keep headline at the same position
- Equal gutters between all cards (horizontal and vertical)
- No asymmetric "featured" cards at twice the width unless it is a distinct component (hero card)

## Component patterns
- Card image: 16:9 or 4:3 aspect ratio, always the same across the grid; no image = solid color or icon fill
- Card headline: Subheadline size, medium weight, 2-line max with ellipsis
- Card description: Secondary size, muted color, 2–3 line max
- Card metadata (date, author, category): Caption size, muted color, below description
- Card CTA: text link or ghost button — not a full-width solid button inside the card

## Anti-patterns
- Mixed content types in the same grid (blog posts and team members in the same card grid)
- Cards with wildly different numbers of lines — forces awkward height alignment
- More than 4 columns on desktop — cards become too small to read
- Hover effects that reveal entirely new content (lazy loading text on hover is a red flag)
- Cards that are not clickable when the grid implies browsing
- A masonry layout when items have comparable heights — use masonry only for truly variable-height content (images, quotes)

## Self-critique checklist
- [ ] Philosophy: Are all cards the same content type? Does the grid help users browse or compare?
- [ ] Hierarchy: Is the headline the dominant element? Is metadata the least prominent?
- [ ] Specificity: Do card labels and descriptions reflect actual items from the brief?
- [ ] Restraint: Are there ≤4 columns? Are all cards structurally identical?
- [ ] Completeness: Does every card have a headline? Is there a consistent secondary element?
- [ ] P0: All cards in the grid must share the same structure — no mixed layouts
- [ ] P0: Maximum 4 columns on desktop

## Example prompts
- "Blog post grid: 3 columns, each card has cover image, category tag, headline, author name, date"
- "Team member grid: 4 columns, each card has photo, name, role, optional LinkedIn icon"
- "Case study grid: 2 columns, each card has company logo, headline, 2-sentence summary, 'Read more' link"
