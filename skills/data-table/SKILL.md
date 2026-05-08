---
craft:
  block_type:  data-table
  label:       Data Table
  scenario:    both
  description: A structured grid for displaying rows of comparable data. Built for scanning, not reading.
  version:     1.0.0
---

## Purpose
A data table lets users scan, compare, sort, and act on multiple records at once. Every design decision should reduce cognitive load: consistent row height, clear column alignment, readable density. The empty state is as important as the populated state.

## Required elements
- Column headers (label + optional sort indicator)
- Data rows (consistent height, clear text alignment per column type)
- Empty state (always — never a blank table)
- Optional: row checkbox for bulk selection
- Optional: pagination or infinite scroll indicator
- Optional: per-row action (single icon button or "..." menu — not full button row)

## Layout rules
- Maximum 8 columns — more requires a horizontal scroll or column visibility toggle
- Text columns: left-aligned; number/date columns: right-aligned; status columns: centered
- Column header: same alignment as its column data
- Sticky header on scroll — the column labels must always be visible
- Row height: consistent — do not vary height between rows
- Minimum column width: enough to avoid truncation on typical values

## Component patterns
- Column header: Label size (smaller than body), medium weight, muted color, uppercase optional
- Row text: Body or Secondary size, primary or muted color
- Status column: use a badge or colored dot, not raw text like "active" / "inactive"
- Sort indicator: chevron icon inline with header label, only on active sort column
- Row hover: subtle background fill change — do not move or reveal hidden elements on hover
- Per-row action: icon button, visible on hover OR always-visible "..." menu

## Anti-patterns
- Tables without an empty state — define what appears when there are zero rows
- More than 8 columns without a column visibility toggle
- Zebra striping as the only row differentiation — it fails in dark mode and for colorblind users
- Editable cells inline without a clear save/cancel mechanism
- Multiple primary actions per row (Edit, Delete, Archive buttons all visible at once)
- Sorting by default on a column that makes no intuitive sense
- Showing "N/A" for every missing field — use "—" (em dash) consistently

## Self-critique checklist
- [ ] Philosophy: Is every column necessary, or is some data better in a detail panel?
- [ ] Hierarchy: Is the sticky header implemented? Are column types aligned correctly?
- [ ] Specificity: Do column labels match the actual data fields from the brief?
- [ ] Restraint: Are there ≤8 columns? Is row density appropriate for the content type?
- [ ] Completeness: Is there an empty state? Is there a sort indicator on at least one column?
- [ ] P0: Empty state is required — a blank table is never acceptable
- [ ] P0: Maximum 8 columns — add a visibility toggle if more data exists

## Example prompts
- "Data table for a user management page — columns: Name, Email, Role, Status, Last active, Actions"
- "Transaction history table — columns: Date, Description, Amount, Status with sort on Date and Amount"
- "Issues list for a project management tool — sortable columns, status badge, per-row action menu"
