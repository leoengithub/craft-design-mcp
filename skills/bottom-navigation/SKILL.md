---
craft:
  block_type:  bottom-navigation
  label:       Bottom Navigation
  scenario:    mobile
  description: The primary tab bar for mobile apps. 3–5 tabs, each with an icon and a visible label.
  version:     1.0.0
---

## Purpose
Bottom navigation gives mobile users instant access to the top-level sections of an app. Because it's always visible, it carries the app's information architecture in a single glance. Every tab must be a first-class destination — not a utility action, not a secondary feature.

## Required elements
- 3–5 tab items
- Each tab: an icon AND a visible text label (never icon-only)
- An active state indicator on the current tab
- Fixed position at the bottom of the screen, above the system home indicator

## Layout rules
- Equal-width tabs across the full device width
- Minimum touch target per tab: 44×44pt/dp
- Icon centered above label; both vertically centered within the tab
- Active tab: accent-colored icon and label; inactive: muted color
- Safe area: respect the bottom safe area (home indicator notch) — add padding below the bar
- Badge (notification count): small circle above the icon, top-right — only on relevant tabs

## Component patterns
- Tab icon: 24–26px, outline style when inactive, filled style when active (or accent color change)
- Tab label: Caption size (10–12pt/sp), medium weight
- Active state: accent color on icon + label, no background fill (or a subtle pill behind icon)
- Badge: 16×16px red circle, 10px/700 white number — only show when there are unread items
- Bar background: page background color or with a subtle top border/shadow separator

## Anti-patterns
- Icon-only tabs (no visible labels) — fails accessibility and forces users to memorize icons
- More than 5 tabs — restructure information architecture instead
- Fewer than 3 tabs — use a different navigation pattern (top tabs, drawer)
- Utility actions in the bottom nav (e.g. "Scan QR", "Upload") — these belong in a FAB or toolbar
- A tab labeled "More" that opens a menu — if you need this, your IA has too many sections
- Active state indicated only by a change in icon style with no color change — too subtle
- Bottom navigation on desktop or tablet layouts

## Self-critique checklist
- [ ] Philosophy: Does each tab represent a true top-level destination, not a feature or action?
- [ ] Hierarchy: Is the active tab unmistakably distinct from inactive tabs?
- [ ] Specificity: Do tab labels match the actual sections from the brief?
- [ ] Restraint: Are there 3–5 tabs? Do all tabs have visible labels?
- [ ] Completeness: Is there an active state? Is there safe area padding at the bottom?
- [ ] P0: Every tab must have a visible text label — no icon-only tabs
- [ ] P0: 3–5 tabs only — never fewer than 3, never more than 5

## Example prompts
- "Bottom navigation for a social app: Home, Search, Post (FAB), Notifications, Profile — 4 tabs + FAB"
- "Bottom nav for a finance app: Dashboard, Transactions, Cards, Settings"
- "Tab bar for a fitness app: Today, Workouts, Progress, Profile — 4 tabs with badge on Notifications"
