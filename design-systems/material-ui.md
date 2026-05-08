---
craft:
  name:          material-ui
  label:         Material UI
  reference:     mui.com
  direction_fit: [focused-calm, data-dense-pro]
  version:       1.0.0
---

## Color

| Token       | Hex       | Description                                |
|-------------|-----------|--------------------------------------------|
| bg          | #FFFFFF   | White — default light theme background     |
| surface     | #FFFFFF   | Paper and component surfaces               |
| surface-alt | #F5F5F5   | Gray-100 — subtle section/background fill  |
| border      | #E0E0E0   | Gray-300 — dividers and outlined controls  |
| border-alt  | #BDBDBD   | Gray-400 — emphasized borders              |
| text        | #212121   | Gray-900 — primary body text               |
| muted       | #616161   | Gray-700 — secondary text                  |
| faint       | #9E9E9E   | Gray-500 — disabled, captions, placeholder |
| primary     | #1976D2   | Blue-700 — primary actions and links       |
| primary-alt | #1565C0   | Blue-800 — hover and emphasis              |
| secondary   | #9C27B0   | Purple-500 — secondary actions sparingly   |
| error       | #D32F2F   | Red-700 — errors and destructive states    |
| warning     | #ED6C02   | Orange-700 — warnings                      |
| info        | #0288D1   | Light-blue-700 — informational states      |
| success     | #2E7D32   | Green-800 — success states                 |

## Typography

| Role        | Size  | Weight | Usage                               |
|-------------|-------|--------|-------------------------------------|
| Display     | 48px  | 400    | Page-level hero or dashboard title  |
| Headline    | 34px  | 400    | Section titles, dialog headlines    |
| Subheadline | 24px  | 400    | Card and panel titles               |
| Body        | 16px  | 400    | Default body text                   |
| Secondary   | 14px  | 400    | Supporting text, table cells        |
| Label       | 14px  | 500    | Buttons, tabs, input labels         |
| Caption     | 12px  | 400    | Captions, helper text, metadata     |

Typeface: Roboto (fallback: Helvetica, Arial, sans-serif)

## Spacing

Base unit: 8px
Scale: 4 / 8 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96

## Layout

- Max content width: 1200px for app screens, 1280px for marketing pages
- Page padding: 16px (mobile) / 24px (tablet) / 32px (desktop)
- Section vertical padding: 48px (desktop) / 32px (mobile)
- Grid: 12-column desktop grid with 24px gutters; 4-column mobile grid
- App shells should use persistent navigation, clear content regions, and standard responsive breakpoints

## Components

- Buttons: contained primary for the main action, outlined or text variants for secondary actions, 4px radius
- Cards: Paper surface, 1px border or low elevation, 4px radius, structured header/content/actions regions
- Inputs: outlined TextField by default, visible label, helper/error text below field, 40–56px control height
- Tabs: text labels with indicator line; icons only when paired with visible text
- Tables: dense mode is acceptable for admin tools; preserve header, row hover, pagination, and empty state
- Dialogs: title, content, actions; one primary action and one dismiss path
- Chips and badges: use semantic palette colors, not random custom fills

## Motion

- Default duration: 150ms–250ms
- Easing: ease-in-out for standard UI transitions
- Use built-in component transitions for dialogs, drawers, menus, and ripples
- Motion should clarify state changes, not decorate static content

## Voice

- Clear, familiar, and functional — Material UI is strongest in product interfaces
- Use direct action labels: "Save changes", "Invite user", "Create project"
- Validation copy is specific and field-level
- Avoid marketing slogans inside app controls, tables, forms, and dialogs

## Brand

- Material UI is a pragmatic React implementation of Material Design patterns
- It works best when hierarchy comes from component roles, spacing, and state rather than heavy custom decoration
- Roboto, blue primary actions, standard form fields, tabs, drawers, and dialogs create the recognizable system feel
- The system can support dense SaaS/admin tools, but it should remain orderly and accessible

## Anti-patterns
- Replacing standard Material UI states with custom one-off hover/focus behavior
- Icon-only navigation or tabs without labels
- Removing TextField labels and relying only on placeholders
- Multiple contained primary buttons in the same decision area
- Mixing contained, outlined, text, and custom button styles without hierarchy
- Heavy custom shadows, oversized border radius, or glassmorphism that fights the Material surface model
- Using secondary purple as a dominant brand color unless the product explicitly requires it
- Custom form controls when a standard MUI component covers the interaction
