---
craft:
  name:          vercel
  label:         Vercel
  reference:     vercel.com
  direction_fit: [focused-calm]
  version:       1.0.0
---

## Color

| Token       | Hex       | Description                               |
|-------------|-----------|-------------------------------------------|
| bg          | #000000   | Black — page background (dark-first)      |
| surface     | #111111   | Near-black — card and panel surfaces      |
| surface-alt | #1A1A1A   | Slightly lighter surface                  |
| border      | #333333   | Dark border — dividers                    |
| border-alt  | #444444   | Emphasized border                         |
| text        | #EDEDED   | Near-white — primary text                 |
| muted       | #888888   | Mid-gray — secondary text, captions       |
| faint       | #555555   | Faint — disabled, de-emphasized           |
| primary     | #FFFFFF   | White — CTA fill on dark background       |
| accent      | #0070F3   | Blue — links, focus rings (light mode)    |
| success     | #50E3C2   | Teal green — success states               |
| error       | #FF0000   | Red — errors                              |

## Typography

| Role        | Size  | Weight | Usage                          |
|-------------|-------|--------|--------------------------------|
| Display     | 56px  | 700    | Hero headlines, large callouts |
| Headline    | 36px  | 700    | Section titles                 |
| Subheadline | 24px  | 600    | Subsection titles              |
| Body        | 16px  | 400    | Default body text              |
| Secondary   | 14px  | 400    | Supporting text, captions      |
| Label       | 13px  | 500    | Buttons, tags, code labels     |
| Mono        | 13px  | 400    | Code, CLI output, filenames    |

Typeface: Geist (fallback: Inter, system-ui)

## Spacing

Base unit: 4px
Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128

## Layout

- Max content width: 1200px
- Page padding: 24px (mobile) / 48px (desktop)
- Section vertical padding: 80px (desktop) / 56px (mobile)
- Column grid: 12-column, 24px gutters

## Components

- Buttons: flat, no shadow, 6px radius, Label size (13px/500), white fill on black bg
- Cards: 1px border (#333333), 8px radius, #111111 fill
- Inputs: 1px border (#333333), 6px radius, #111111 fill, 40px height
- Code blocks: #0A0A0A fill, 8px radius, mono font
- Badges: 4px radius, outlined or subtle fill

## Motion

- Default duration: 100ms
- Easing: ease-out
- Hover transitions only — no entrance animations
- Deploy/progress states: 150ms with subtle fade

## Voice

- Terse and technical — every word earns its place
- Developer-first framing: ships, deploys, functions — not "achieves" or "empowers"
- Error messages are diagnostic, not apologetic: "Build failed: 3 errors"
- CTA labels are direct verbs: "Deploy", "Connect", "View logs"

## Brand

- Dark-first and unapologetically so — Vercel is a terminal product at heart
- Geist typeface gives it a distinct identity; monospace is a first-class citizen
- White on black is the default; light mode is an opt-in exception
- No decoration — the product itself is the visual

## Anti-patterns
- Light mode as primary — Vercel is dark-first
- Drop shadows on any surface
- Gradients on buttons or hero backgrounds
- Rounded corners above 8px on interactive elements
- Color beyond the defined palette — especially no blues except for links/focus
- Body copy at display sizes — this system lives in tight, precise type
- Animation beyond 150ms
