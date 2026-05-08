---
craft:
  block_type:  modal
  label:       Modal / Dialog
  scenario:    both
  description: An overlay dialog that demands a decision or presents focused content. One task, one outcome.
  version:     1.0.0
---

## Purpose
A modal pauses the current flow to demand a decision or focused action. Because it takes over the screen, it must earn that interruption: the content must be necessary, the action must be clear, and closing must always be easy. Modals are for decisions, confirmations, and short focused tasks — not for reading or exploring.

## Required elements
- A clear modal title (what this modal is for)
- Modal content (a description, form fields, or confirmation message)
- A primary action button with a specific label
- A dismiss mechanism (X button in the top-right, and/or a Cancel button, and/or Escape key)
- A backdrop overlay behind the modal

## Layout rules
- Maximum width: 480–600px on desktop; full-width with side margins on mobile
- Vertically centered on desktop; bottom sheet on mobile is acceptable for short modals
- Title at the top, actions at the bottom — content fills the middle
- Actions are right-aligned on desktop (Cancel left, Primary right); full-width stacked on mobile
- Never scroll the page behind an open modal — scroll the modal body if content overflows

## Component patterns
- Modal title: Subheadline size, bold
- Body text: Body size, standard line height — if more than 4 lines, consider a different pattern
- Primary button: matches the page's primary button style — specific label ("Delete project", "Confirm payment")
- Cancel button: secondary or ghost style, labeled "Cancel" (not "Close" or "Go back")
- Backdrop: semi-transparent black overlay (rgba(0,0,0,0.4)–0.6), click-to-dismiss
- X button: top-right corner, icon-only, accessible label

## Anti-patterns
- Full-screen modal for a simple confirmation — a 2-button confirm dialog needs no more than 400px width
- Modal opened from inside another modal (nested modals)
- No dismiss mechanism — always provide a way out
- A modal that contains a table or data-heavy content — use a drawer or a separate page instead
- Autoplay video or animated content inside a modal
- Primary action labeled "OK" or "Yes" — use the specific action name ("Delete", "Save", "Send")
- More than one primary action button in the modal footer

## Self-critique checklist
- [ ] Philosophy: Is this modal necessary? Could this action happen inline without an overlay?
- [ ] Hierarchy: Is the title prominent? Are the actions clearly separated from content?
- [ ] Specificity: Does the title and primary button label describe the exact action from the brief?
- [ ] Restraint: Is there exactly one primary action? Is the modal width appropriate for the content?
- [ ] Completeness: Is there a dismiss mechanism? Is the backdrop present?
- [ ] P0: Exactly one primary action — never two primary buttons in a modal footer
- [ ] P0: Always provide a dismiss mechanism — X button, Cancel, or both

## Example prompts
- "Delete confirmation modal: 'Delete project?' with a warning message, Cancel and Delete buttons"
- "Invite member modal: email input + role selector, 'Send invite' primary action"
- "Payment confirmation modal: order summary, 'Confirm payment' CTA, Cancel link"
