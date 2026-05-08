---
craft:
  block_type:  mobile-screen-header
  label:       Screen Header
  scenario:    mobile
  description: The top bar of a mobile screen. Carries the screen title and up to two contextual actions.
  version:     1.0.0
---

## Purpose
The mobile screen header orients the user: where am I and what can I do here? It must communicate the screen's identity in one glance and expose only the actions that are relevant to the current screen — not global actions, not settings that don't apply here.

## Required elements
- Screen title (single line — no subtitles)
- Back button (if this screen is not a root/tab screen)
- Optional: up to 2 action icons in the top-right (e.g. search, filter, share, edit)
- No more than 2 action icons total — ever

## Layout rules
- Full-width, fixed height: 44–56px (follows platform conventions — 44pt on iOS, 56dp on Android)
- Title: horizontally centered (iOS default) OR left-aligned (Android/Material default) — choose one and be consistent
- Back button: left-aligned, icon + optional short label ("Back" or parent screen name)
- Action icons: right-aligned, 44×44px tap target minimum
- No horizontal scrolling in the header — overflow is not acceptable

## Component patterns
- Title: Label or Subheadline size (17–18pt/sp), medium or semibold weight
- Back button: chevron icon (iOS) or arrow icon (Android), 20–22px, primary color
- Action icons: 22–24px, primary or muted color, minimum 44×44px tap area
- Header background: matches the page background or uses a subtle divider/shadow below

## Anti-patterns
- More than 2 action icons in the header — move actions to a "..." overflow menu
- Long screen titles that truncate awkwardly — keep titles under 20 characters
- A subtitle below the title — screen headers carry one line only
- Global actions (profile, settings) in a screen header that only apply to this screen
- Search as an inline input in the header — use a search bar below the header or a dedicated search screen
- Action icons without accessible labels (voiceover/talkback must have a label)
- Hiding the back button on a non-root screen

## Self-critique checklist
- [ ] Philosophy: Does the header tell the user exactly where they are and what they can do?
- [ ] Hierarchy: Is the title the most prominent text? Are actions secondary?
- [ ] Specificity: Does the title match the actual screen name from the brief?
- [ ] Restraint: Are there ≤2 action icons? Is the title a single line?
- [ ] Completeness: Is there a back button if this is a nested screen? Do icons have accessible labels?
- [ ] P0: Maximum 2 action icons — use an overflow menu for additional actions
- [ ] P0: Title must fit on one line — no subtitles, no truncation on typical device widths

## Example prompts
- "Screen header for a profile editing screen: back button, 'Edit Profile' title, Save action icon"
- "Chat thread header: back button, contact name, call and video icons on the right"
- "Notifications screen header: back button (or tab-root, no back), 'Notifications' title, filter icon"
