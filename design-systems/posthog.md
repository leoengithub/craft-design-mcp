---
craft:
  name:          posthog
  label:         PostHog
  reference:     posthog.com
  direction_fit: [data-dense-pro]
  version:       1.0.0
---

## Color

| Token    | Hex       | Description                          |
|----------|-----------|--------------------------------------|
| primary  | #1D4AFF   | Electric blue — primary actions      |
| bg       | #1A1A1A   | Near-black — primary background      |
| surface  | #2C2C2C   | Dark gray — card and panel surfaces  |
| text     | #FFFFFF   | White — primary text                 |
| muted    | #888888   | Medium gray — secondary text         |
| border   | #3A3A3A   | Dark border — dividers               |
| accent   | #F7A501   | Amber — highlights, warnings         |

## Typography

| Role        | Size  | Weight | Usage                        |
|-------------|-------|--------|------------------------------|
| Display     | 40px  | 700    | Hero headlines               |
| Headline    | 28px  | 600    | Section titles               |
| Subheadline | 20px  | 600    | Subsection titles            |
| Body        | 14px  | 400    | Default body text            |
| Secondary   | 12px  | 400    | Supporting text, captions    |
| Label       | 13px  | 500    | Buttons, tags, form labels   |
| Mono        | 13px  | 400    | Code, values, metrics        |

Typeface: Inter for UI, JetBrains Mono for data

## Spacing

Base unit: 4px
Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64

## Layout

- Max content width: 1440px
- Page padding: 16px (mobile) / 24px (desktop)
- Dense sections: 32px vertical padding
- Column grid: 12-column, 16px gutters, tight

## Components

- Buttons: filled, 6px radius, Label size (13px/500)
- Cards: dark surface (#2C2C2C), 1px border, 8px radius
- Tables: tight rows (36px height), alternating row backgrounds
- Charts: primary blue + amber accent

## Motion

- Default duration: 100ms
- Easing: ease-out
- Minimal — data should not animate gratuitously

## Voice

- Technical precision — engineers and data analysts are the audience
- Numbers and specifics over adjectives
- No marketing softening — state facts directly

## Brand

- Dark-first — light mode is secondary
- Data density is a feature, not a bug
- Monospace type for all metric values

## Anti-patterns
- Light backgrounds on primary surfaces
- Decorative non-data visuals
- Rounded corners above 8px
- Warm color temperature
- Large empty whitespace sections
