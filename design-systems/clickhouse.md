---
craft:
  name:          clickhouse
  label:         ClickHouse
  reference:     clickhouse.com
  direction_fit: [data-dense-pro]
  version:       1.0.0
---

## Color

| Token       | Hex       | Description                               |
|-------------|-----------|-------------------------------------------|
| bg          | #141414   | Deep black — page background              |
| surface     | #1C1C1C   | Dark surface — cards, panels              |
| surface-alt | #242424   | Slightly elevated surface                 |
| border      | #2E2E2E   | Dark border — dividers                    |
| border-alt  | #3D3D3D   | Emphasized border                         |
| text        | #F0F0F0   | Near-white — primary text                 |
| muted       | #999999   | Mid-gray — secondary text, captions       |
| faint       | #666666   | Faint — disabled, de-emphasized           |
| primary     | #FAFF69   | Bright yellow — brand accent, CTA         |
| primary-alt | #E8ED00   | Deeper yellow — hover on accent           |
| primary-text| #0F0F0F   | Near-black text on yellow background      |
| series-1    | #4B8BF5   | Chart blue                                |
| series-2    | #F54B4B   | Chart red                                 |
| series-3    | #4BF5A0   | Chart green                               |
| series-4    | #F5A04B   | Chart orange                              |
| error       | #F54B4B   | Red — errors                              |
| success     | #4BF5A0   | Green — success                           |

## Typography

| Role        | Size  | Weight | Usage                           |
|-------------|-------|--------|---------------------------------|
| Display     | 40px  | 700    | Page headlines                  |
| Headline    | 28px  | 600    | Section titles                  |
| Subheadline | 20px  | 500    | Subsection titles               |
| Body        | 14px  | 400    | Default body text (dense)       |
| Secondary   | 13px  | 400    | Supporting text, captions       |
| Label       | 13px  | 500    | Buttons, table headers          |
| Mono        | 12px  | 400    | SQL, query syntax, values       |

Typeface: Inter (fallback: system-ui)

## Spacing

Base unit: 4px
Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48

## Layout

- Max content width: 1440px
- Page padding: 16px (mobile) / 24px (desktop)
- Section vertical padding: 48px (desktop) / 32px (mobile)
- Table row height: 36px (dense)
- Sidebar width: 240px fixed

## Components

- Primary button: #FAFF69 fill, #0F0F0F text, 4px radius, 13px/500, 8px 16px padding
- Secondary button: #242424 fill, #2E2E2E border, #F0F0F0 text
- Cards: 1px border (#2E2E2E), 4px radius, #1C1C1C fill
- Inputs: 1px border (#3D3D3D), 4px radius, #1C1C1C fill, 36px height
- Tables: sticky header, 36px row height, alternating #141414/#1C1C1C rows
- Badges: 3px radius, 11px/500, uppercase labels

## Motion

- Default duration: 100ms
- Easing: linear for data, ease-out for UI
- No entrance animations — data appears immediately
- Chart renders: instant, no build-up animation

## Voice

- Technical and precise — ClickHouse talks to data engineers and architects
- SQL-native framing: "query", "ingest", "shard", "replica" — not "analyze" or "visualize"
- Density is a feature, not a bug — abbreviations are welcome in data contexts
- Error messages are diagnostic: "Query failed: timeout after 30s on node ch-1"

## Brand

- ClickHouse is the database for extreme data workloads — its design reflects that
- The yellow accent (#FAFF69) is bold and functional — it highlights the critical path
- Dark background + yellow = high contrast for long working sessions
- Monospace is a first-class typeface — SQL is a primary UI element

## Anti-patterns
- Light mode as default — ClickHouse is dark-first
- Rounded corners above 6px on any element
- Whitespace used decoratively — every pixel should carry information
- Chart animations or build-up effects — data appears instantly
- Marketing copy or brand language in product blocks
- Metric cards without comparison values or baseline context
- Hiding data behind progressive disclosure when screen space allows
