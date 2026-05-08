---
craft:
  name:          linear
  label:         Linear
  reference:     linear.app
  direction_fit: [focused-calm]
  version:       1.0.0
---

## Color

| Token    | Hex       | Description                        |
|----------|-----------|------------------------------------|
| primary  | #5E6AD2   | Indigo-blue — primary CTA          |
| bg       | #F7F7F5   | Off-white — page background        |
| surface  | #FFFFFF   | White — card and panel surfaces    |
| text     | #1A1A1A   | Near-black — body text             |
| muted    | #6B6B6B   | Medium gray — secondary text       |
| border   | #E5E5E5   | Light gray — dividers and borders  |

## Typography

| Role        | Size  | Weight | Usage                        |
|-------------|-------|--------|------------------------------|
| Display     | 48px  | 600    | Hero headlines               |
| Headline    | 32px  | 600    | Section titles               |
| Subheadline | 24px  | 500    | Subsection titles            |
| Body        | 16px  | 400    | Default body text            |
| Secondary   | 14px  | 400    | Supporting text, captions    |
| Label       | 14px  | 500    | Buttons, tags, form labels   |
| Caption     | 12px  | 400    | Fine print, metadata         |

Typeface: Inter (fallback: system-ui)

## Spacing

Base unit: 4px
Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96

## Layout

- Max content width: 1200px
- Page padding: 24px (mobile) / 48px (desktop)
- Section vertical padding: 64px (desktop) / 48px (mobile)
- Column grid: 12-column, 24px gutters

## Components

- Buttons: flat, no shadow, 8px radius, Label size (14px/500)
- Cards: 1px border (#E5E5E5), 12px radius, no shadow
- Inputs: 1px border, 8px radius, 40px height
- Badges: 4px radius, filled or outlined

## Motion

- Default duration: 150ms
- Easing: ease-out
- No decorative animations — transitions only

## Voice

- Direct and specific — no marketing filler
- Product-centric — what it does, not what it aspires to be
- Technical precision valued over warmth

## Brand

- Elevation: flat — no drop shadows on primary surfaces
- Iconography: 16px stroke icons, 1.5px stroke weight
- Illustration: none — photography or product screenshots only

## Anti-patterns
- Drop shadows on cards or buttons
- Gradients on any interactive element
- Rounded corners above 12px
- Color outside the defined palette
- Decorative illustrations or hand-drawn elements
- Animation beyond 200ms duration
