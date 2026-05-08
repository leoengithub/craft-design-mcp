---
craft:
  block_type:  kpi-summary
  label:       KPI Summary
  scenario:    both
  description: A row of metric cards. Each card answers one specific business question with one number.
  version:     1.0.0
---

## Purpose
A KPI summary gives decision-makers the pulse of the product at a glance. Each metric card answers one specific question: "How many users signed up this week?" not "Tell me about users." The value is not the number — it's the number plus context (trend, comparison, or threshold).

## Required elements
- 3–6 metric cards in a horizontal row (or 2-column grid on mobile)
- Each card: a label (the question), a primary value (the answer), and a delta or trend indicator
- Delta must include direction (up/down arrow or color) and a reference period ("vs last week")
- Optional: a sparkline chart inside the card for trend context

## Layout rules
- Equal-width cards — no card gets more real estate than another
- Horizontal row on desktop, 2-column grid on mobile
- Label above the value, delta below — never reorder this hierarchy
- Maximum 6 cards — more dilutes focus; force prioritization
- Cards are not clickable by default unless drilling down is a primary use case

## Component patterns
- Label: Secondary size (14px), muted color, uppercase or medium weight
- Primary value: Display or Headline size, bold — the biggest text on the card
- Delta: small text with directional color (green = up/positive, red = down/negative) and reference label
- Sparkline: optional, max 8px tall inline chart, muted color
- Card: light border, subtle surface fill, no shadow

## Anti-patterns
- More than 6 metric cards in a single row
- Invented numbers — every metric must come from the brief or be explicitly marked as placeholder
- Delta without a reference period ("↑ 12%" with no "vs last week" context)
- Primary value as text instead of a number ("Good", "On track")
- Mixing incomparable metrics in the same row (revenue in dollars next to NPS as a percentage without clear labels)
- Cards that open to a detail view without any visual affordance that they're interactive
- Sparklines on every card when only 2–3 are meaningful

## Self-critique checklist
- [ ] Philosophy: Does each card answer exactly one business question?
- [ ] Hierarchy: Is the primary value the largest text? Is the label above and delta below?
- [ ] Specificity: Do the metric labels match actual KPIs from the brief, not generic examples?
- [ ] Restraint: Are there ≤6 cards? Does each delta include a reference period?
- [ ] Completeness: Does every card have a label, value, and delta? Are units labeled?
- [ ] P0: No invented numbers — all values must come from the brief or be marked placeholder
- [ ] P0: Every delta must include a reference period (e.g. "vs last week", "vs last month")

## Example prompts
- "KPI row for a SaaS dashboard — MRR, Active users, Churn rate, NPS — show week-over-week delta"
- "Analytics summary for an e-commerce admin — Orders today, Revenue today, Avg order value, Conversion rate"
- "4-metric summary for a support team: Open tickets, Avg response time, CSAT, Tickets closed today"
