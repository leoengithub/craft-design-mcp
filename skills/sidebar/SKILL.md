---
craft:
  block_type:  sidebar
  label:       Sidebar
  scenario:    web
  description: Vertical application navigation. Fixed-width panel on the left with hierarchical links and workspace context.
  version:     1.0.0
---

## Purpose
The sidebar is the primary wayfinding structure for app-style products. Unlike a top navigation bar (which is page-level), the sidebar holds section-level navigation and is always visible. It tells the user where they are in the application hierarchy and how to get anywhere else in under 2 clicks.

## Required elements
- A brand mark or workspace/account identifier at the top
- Primary navigation items (icons + labels — never icons alone)
- Active state on the current page
- Optional: secondary navigation section (settings, help, profile) at the bottom
- Optional: nested items up to 2 levels deep (not 3)
- Optional: a collapse/expand toggle for narrow viewport support

## Layout rules
- Fixed width: 220–260px (desktop); collapsible to 64px (icon-only) if space is constrained
- Navigation items: 36–40px height, full-width, left-aligned
- Nested items: 8–12px indent from parent; a connecting line is optional but not required
- Active item: accent-colored background fill or left border (2–4px) — not just bold text
- Bottom section: pinned to the bottom of the sidebar, separated by a divider
- Maximum 3 nesting levels total — if more are needed, restructure the information architecture

## Component patterns
- Nav item: icon (16–20px) + label (Secondary size, medium weight), 12px horizontal padding
- Active state: accent fill or accent left border + primary text color
- Hover state: subtle background fill change, no icon movement
- Section label (optional): Caption size, uppercase, muted color — used to group items
- Collapse toggle: icon-only button at the bottom or top of the sidebar
- Nested items: same structure as parent items, reduced padding to show hierarchy

## Anti-patterns
- Icon-only navigation items (no labels) — inaccessible and fails for non-power users
- More than 3 levels of nesting — forces information architecture restructuring
- Active state indicated by bold text alone — fails for color-blind users
- Sidebar that auto-expands nested sections on hover
- More than 8 primary navigation items without grouping
- Mixing app navigation items with help/support links in the same list
- A sidebar that is wider than 280px without explicit justification

## Self-critique checklist
- [ ] Philosophy: Does every sidebar item represent a distinct section users need access to?
- [ ] Hierarchy: Is the brand mark at the top? Is the active state immediately recognizable?
- [ ] Specificity: Do navigation labels match the actual sections from the brief?
- [ ] Restraint: Are there ≤3 nesting levels? Do all icons have visible labels?
- [ ] Completeness: Is there an active state? Is there a bottom section for secondary items?
- [ ] P0: No icon-only navigation — every item must have a visible text label
- [ ] P0: Maximum 3 nesting levels — never exceed this

## Example prompts
- "App sidebar for a project management tool: workspace name, Projects, Issues, Inbox, Settings at bottom"
- "Admin sidebar: Dashboard, Users, Billing, Integrations, Settings — with an avatar + workspace name at top"
- "Analytics app sidebar: Overview, Funnels, Retention, Cohorts, Settings — nested under Analytics section"
