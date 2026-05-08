---
craft:
  name:          stripe
  label:         Stripe
  reference:     stripe.com
  direction_fit: [focused-calm]
  version:       1.0.0
---

## Color

| Token       | Hex       | Description                              |
|-------------|-----------|------------------------------------------|
| bg          | #FFFFFF   | White — page background                  |
| surface     | #F6F9FC   | Light blue-gray — card and panel surface |
| surface-alt | #EEF2F7   | Slightly deeper surface                  |
| border      | #E0E7EF   | Pale border — dividers                   |
| border-alt  | #C1CDDB   | Emphasized border                        |
| text        | #0A2540   | Dark navy — primary text                 |
| muted       | #425466   | Slate gray — secondary text              |
| faint       | #8898AA   | Light slate — captions, placeholders     |
| primary     | #635BFF   | Indigo-purple — primary CTA, links       |
| primary-alt | #4F47E5   | Deeper indigo — hover state              |
| success     | #00D924   | Green — success                          |
| error       | #DF1B41   | Red — errors                             |
| warning     | #F7AB0A   | Amber — warnings                         |

## Typography

| Role        | Size  | Weight | Usage                          |
|-------------|-------|--------|--------------------------------|
| Display     | 52px  | 700    | Hero headlines                 |
| Headline    | 36px  | 600    | Section titles                 |
| Subheadline | 24px  | 600    | Subsection titles              |
| Body        | 16px  | 400    | Default body text              |
| Secondary   | 14px  | 400    | Supporting text, captions      |
| Label       | 14px  | 500    | Buttons, form labels           |
| Caption     | 12px  | 400    | Fine print, metadata           |

Typeface: Inter (fallback: system-ui)

## Spacing

Base unit: 4px
Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96

## Layout

- Max content width: 1140px
- Page padding: 20px (mobile) / 40px (desktop)
- Section vertical padding: 80px (desktop) / 48px (mobile)
- Column grid: 12-column, 20px gutters

## Components

- Primary button: #635BFF fill, white text, 6px radius, 14px/500, no shadow
- Secondary button: white fill, #E0E7EF border, #0A2540 text
- Cards: 1px border (#E0E7EF), 8px radius, subtle #F6F9FC surface, no shadow
- Inputs: 1px border (#C1CDDB), 6px radius, white fill, 40px height
- Badges: 4px radius, pale color fill matching semantic meaning

## Motion

- Default duration: 200ms
- Easing: cubic-bezier(0.25, 0.1, 0.25, 1)
- Hover: smooth color transitions on buttons and links
- No entrance animations in product UI — marketing pages may use scroll-triggered reveal

## Voice

- Precise and confident — Stripe talks to developers and CFOs simultaneously
- Active and direct: "Process payments", "Manage subscriptions" not "Payment processing solutions"
- Technical accuracy matters: use correct product names (Checkout, Elements, Connect)
- Error messages are specific: "Card declined: insufficient funds" not "Payment failed"

## Brand

- Stripe is polished finance infrastructure — rigorous but not cold
- Navy + purple signals trustworthiness and intent; it avoids startup casualness
- The light blue-gray surface (#F6F9FC) is a Stripe signature — subtle, clean, premium
- Gradients appear sparingly in marketing contexts (never in product UI)

## Anti-patterns
- Dark mode as default — Stripe is light-first
- Drop shadows stronger than 1px border — elevation is implied by surface color, not shadow
- Gradients in product UI or on buttons
- Off-brand colors — especially no warm tones (orange, yellow) in primary contexts
- Generic CTA labels: "Submit", "Click here", "Learn more"
- Decorative illustration in product blocks — only in marketing hero contexts
- More than one indigo CTA visible at once on a single block
