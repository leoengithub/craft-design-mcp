---
craft:
  block_type:  form
  label:       Form
  scenario:    both
  description: A structured input collection block. Single-column, logically grouped, with clear validation.
  version:     1.0.0
---

## Purpose
A form asks users to give information. Every field is a request — and requests have a cost. A well-designed form earns each field by making the purpose clear, grouping logically related questions, and showing errors at the right moment (not before the user has had a chance to answer).

## Required elements
- A form heading (what this form does)
- Input fields with visible labels above each field
- A primary submit button with a specific label (not "Submit")
- Inline error messages (appear after the user has interacted with a field, not before)
- Required field indicator where relevant (asterisk or "(required)" label — be consistent)

## Layout rules
- Single column — always; multi-column forms are harder to complete and scan
- Label above the input — never beside it, never as a placeholder only
- Logical grouping: related fields clustered together, with a group heading if >4 fields
- Submit button at the bottom, full-width on mobile, fixed-width on desktop
- Error messages: inline, below the affected field, in red, short and specific

## Component patterns
- Input field: 40px height, 1px border, 6–8px radius, visible label above at Label size
- Placeholder text: a concrete example of valid input ("e.g. john@company.com") — not a repeat of the label
- Select dropdown: same height and border as text inputs
- Checkbox/radio: label to the right, vertically centered
- Error state: red border on input, red error text below, no icon needed
- Success state: green border or checkmark (only after successful submission or blur)

## Anti-patterns
- Placeholder text as the only label — it disappears when the user starts typing
- Multi-column layout for primary form fields (side-by-side first name / last name is acceptable if space allows, but not the default)
- Showing all validation errors before the user interacts with any field
- A generic "Submit" button label — use the specific action ("Create account", "Save settings")
- Asking for information the product doesn't immediately need
- Password strength meters that appear before the user starts typing
- CAPTCHA as the first thing a user sees in the form

## Self-critique checklist
- [ ] Philosophy: Is every field justified? Could any be removed or deferred?
- [ ] Hierarchy: Is the heading clear? Is the submit button the most prominent action?
- [ ] Specificity: Do field labels use the exact terminology from the brief?
- [ ] Restraint: Is this a single column? Are there no unnecessary fields?
- [ ] Completeness: Does every field have a visible label? Is there inline error handling?
- [ ] P0: No placeholder-only labels — every field needs a visible label above it
- [ ] P0: Submit button must have a specific action label, not "Submit" or "OK"

## Example prompts
- "Sign-up form: email, password, confirm password — with inline validation"
- "Settings form: display name, email, timezone, notification preferences"
- "Contact form: name, email, subject, message, with a 'Send message' button"
