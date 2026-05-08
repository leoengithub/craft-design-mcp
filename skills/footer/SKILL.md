---
craft:
  block_type:  footer
  label:       Footer
  scenario:    web
  description: Utility navigation at the bottom of the page. Links to important destinations, legal content, and brand identity.
  version:     1.0.0
---

## Purpose
The footer is a utility block, not a marketing block. Its job is to let users who scrolled to the bottom find what they need — legal pages, secondary nav, contact, social — without making them scroll back up. It should not repeat the hero's conversion pitch.

## Required elements
- Brand mark (logo or wordmark)
- Link columns: 3–5 groups of related links (Product, Company, Resources, Legal, etc.)
- Copyright line (year + entity name)
- At least one legal link (Privacy Policy, Terms of Service)
- Optional: social media icons (linked, not decorative)
- Optional: newsletter subscribe field (one input + one button, no more)

## Layout rules
- Horizontal grouping of link columns on desktop, stacked on mobile
- Brand mark anchors the top-left of the footer
- Copyright and legal links anchor the bottom row
- Maximum 5 link columns — more forces information architecture work first
- No visual hierarchy within a column — all links are equal weight

## Component patterns
- Footer links: Body or Secondary size, muted color, no underline by default, underline on hover
- Column headings: Label size, medium weight, primary text color
- Social icons: 20px, muted color, inline horizontal row
- Divider: 1px border above the copyright row

## Anti-patterns
- Marketing copy or value propositions in the footer ("The fastest way to ship")
- Duplicate of primary navigation links — footer should have secondary and utility links
- CTA buttons — the footer is not a conversion surface
- More than 5 link columns (forces information architecture work first)
- Newsletter form as the visual centerpiece of the footer
- Fake social proof: "Trusted by 10,000 companies" in the footer
- Dark footer on a dark-background page without sufficient contrast

## Self-critique checklist
- [ ] Philosophy: Does the footer serve navigation, not marketing?
- [ ] Hierarchy: Is the brand mark visible? Is the copyright row clearly separated?
- [ ] Specificity: Do the link labels reflect real pages from the brief, not placeholder column names?
- [ ] Restraint: Are there ≤5 link columns? Is there at most one optional form element?
- [ ] Completeness: Is there a brand mark, copyright, and at least one legal link?
- [ ] P0: No marketing copy or CTA buttons — footer is utility only
- [ ] P0: No duplicate of primary navigation links

## Example prompts
- "Footer for a SaaS product with Product, Company, Resources, and Legal columns"
- "Minimal footer for a developer tool — wordmark, 3 link groups, GitHub icon"
- "Footer for a marketing site with newsletter subscribe, social icons, and legal links"
