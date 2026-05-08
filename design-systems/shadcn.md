---
craft:
  name:          shadcn
  label:         shadcn/ui
  reference:     ui.shadcn.com
  direction_fit: [focused-calm]
  version:       1.0.0
---

## Color

| Token          | Hex       | Description                              |
|----------------|-----------|------------------------------------------|
| bg             | #FFFFFF   | White — page background (light mode)     |
| surface        | #FAFAFA   | Near-white — card and panel surface      |
| border         | #E4E4E7   | Zinc-200 — dividers                      |
| border-alt     | #D4D4D8   | Zinc-300 — emphasized borders            |
| text           | #09090B   | Zinc-950 — primary text                  |
| muted          | #71717A   | Zinc-500 — secondary text                |
| faint          | #A1A1AA   | Zinc-400 — disabled, de-emphasized       |
| primary        | #18181B   | Zinc-900 — primary CTA fill              |
| primary-text   | #FAFAFA   | Near-white text on primary button        |
| primary-hover  | #27272A   | Zinc-800 — hover on primary              |
| accent         | #F4F4F5   | Zinc-100 — hover state, subtle highlight |
| destructive    | #EF4444   | Red-500 — errors, destructive actions    |
| success        | #22C55E   | Green-500 — success states               |
| ring           | #18181B   | Focus ring color                         |

## Typography

| Role        | Size  | Weight | Usage                          |
|-------------|-------|--------|--------------------------------|
| Display     | 48px  | 700    | Page-level headlines           |
| Headline    | 30px  | 600    | Section titles                 |
| Subheadline | 24px  | 600    | Card titles, dialog headings   |
| Body        | 16px  | 400    | Default body text              |
| Secondary   | 14px  | 400    | Supporting text, captions      |
| Label       | 14px  | 500    | Buttons, form labels, badges   |
| Caption     | 12px  | 400    | Fine print, metadata           |

Typeface: Inter (fallback: system-ui, -apple-system)

## Spacing

Base unit: 4px
Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64

## Layout

- Max content width: 1280px
- Page padding: 16px (mobile) / 32px (desktop)
- Section vertical padding: 64px (desktop) / 40px (mobile)
- Column grid: 12-column, 16px gutters
- Card gap: 16px (default), 24px (comfortable)

## Components

- Primary button: #18181B fill, #FAFAFA text, 6px radius, 14px/500, 10px 16px padding
- Secondary button: white fill, #E4E4E7 border, #09090B text
- Ghost button: no border, no fill, #09090B text, hover: #F4F4F5 fill
- Cards: 1px border (#E4E4E7), 8px radius, white fill, no shadow
- Inputs: 1px border (#E4E4E7), 6px radius, white fill, 40px height, 2px focus ring (#18181B)
- Badges: 4px radius, 12px/500, inline

## Motion

- Default duration: 150ms
- Easing: ease-in-out
- Radix primitives handle dialog/popover animations — respect their defaults
- No custom entrance animations — component animations only

## Voice

- Neutral and functional — shadcn/ui doesn't impose a brand voice
- Labels are precise and minimal: "Save", "Cancel", "Delete"
- Empty states are actionable: "No results — try a different filter"
- Validation is immediate and specific: "Email is required"

## Brand

- shadcn/ui is a component system for developers who want full control
- The zinc gray palette is intentionally neutral — it disappears behind the product
- Black-on-white primary buttons signal intent without brand overhead
- It is designed to be customized: the neutral base lets team colors shine through

## Anti-patterns
- Drop shadows as elevation — use borders instead
- Color-heavy CTAs — the primary is intentionally dark/neutral
- More than one visual style of button on the same block
- Tight spacing — shadcn/ui expects breathing room; density fights the system
- Rounded corners above 8px on cards or inputs
- Overriding the focus ring — accessibility is built in, don't remove it
- Custom colors that conflict with the zinc gray system without a clear reason
