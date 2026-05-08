---
craft:
  block_type:  navigation
  label:       Navigation Bar
  scenario:    both
  description: The primary wayfinding element. Reflects information architecture, not marketing.
  version:     1.0.0
---

## Purpose
Navigation anchors every page. It tells users where they are and where they can go. Its primary job is clarity and speed — not conversion.

## Required elements
- Brand mark (logo or wordmark)
- Primary navigation links (3–6 items)
- Active/current state indicator
- Optional: one CTA button (mirrors the hero CTA if present)
- Optional: utility items (login, search, user avatar)

## Layout rules
- Horizontal bar for web (desktop-first)
- Brand mark on the left, utility items on the right
- CTA button (if present) is the rightmost element and visually distinct
- Mobile: hamburger menu is acceptable on mobile only — never on desktop
- Sticky by default; transparent-on-scroll is acceptable for marketing pages

## Component patterns
- Active state: colored underline or background pill — never bold weight alone
- Dropdown menus: maximum one level deep; open on click not hover
- CTA in nav: same design token as hero CTA but smaller (secondary size)

## Anti-patterns
- Mega menus for products with fewer than 10 sections
- Hamburger menu on desktop at any viewport
- More than 6 top-level items
- Duplicate of footer links
- Marketing copy in the navigation
- Active state indicated only by bold weight

## Self-critique checklist
- [ ] Philosophy: Do the nav items reflect where users go, not what the product wants to sell?
- [ ] Hierarchy: Is the brand mark immediately recognizable? Is the CTA distinct from nav links?
- [ ] Specificity: Do the link labels match the actual pages in the brief?
- [ ] Restraint: Are there 6 or fewer top-level items? At most one CTA button?
- [ ] Completeness: Is there a brand mark, at least 3 links, and an active state?
- [ ] P0: No hamburger on desktop
- [ ] P0: 6 or fewer top-level navigation items

## Example prompts
- "Navigation for a SaaS with Product, Pricing, Docs, Blog, and Login"
- "App nav for a mobile tool — bottom navigation with Home, Search, Notifications, Profile"
- "Marketing site nav — transparent on scroll, CTA mirrors hero"
