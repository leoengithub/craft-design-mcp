---
craft:
  block_type:  onboarding-step
  label:       Onboarding Step
  scenario:    both
  description: A single step in a multi-step onboarding flow. One decision per screen.
  version:     1.0.0
---

## Purpose
Each onboarding step earns the user's next action by asking only one thing. The job is to reduce the perceived cost of completing setup — not to collect every possible piece of information upfront. A great onboarding step feels like a conversation, not a form.

## Required elements
- A step progress indicator (e.g. "Step 2 of 5" or a dot/bar progress strip)
- A headline: what this step is asking or setting up
- A short description or instructional line (optional, ≤1 sentence)
- The input or choice (1–3 fields max, OR a set of option cards)
- A primary "Continue" or "Next" action
- A "Back" or "Skip" option where appropriate

## Layout rules
- Single-column, centered — never multi-column for the primary content
- Progress indicator at the top, CTA at the bottom — nothing else competes
- Maximum 3 input fields per step — if more are needed, split into two steps
- Option cards (if used) are a 2–3 column grid of equal-width choices
- On mobile: full-width inputs and buttons; option cards stack to 1 column

## Component patterns
- Progress indicator: segmented bar or numbered "Step N of M" label — not a percentage
- Headline: Headline size, bold — the single question this step answers
- Instruction text: Body size, muted color, max 1 line
- Input fields: standard height (40px), full-width within the column
- Option cards: border, 8px radius, icon + label inside; selected state: accent border + fill
- Primary button: full-width on mobile, fixed-width (200–240px) on desktop — labeled specifically

## Anti-patterns
- More than 3 input fields on a single step — split the step instead
- A "Skip all" button that bypasses the entire flow
- Unclear progress: no indicator of how many steps remain
- The continue button labeled "Submit" — it's not a form submission, it's a step
- Requiring account creation before showing any value
- Mixing input fields and option cards on the same step
- Showing errors from future steps before the user gets there

## Self-critique checklist
- [ ] Philosophy: Does this step ask exactly one thing? Could it be split further without harm?
- [ ] Hierarchy: Is the progress indicator at the top? Is the CTA at the bottom, prominent?
- [ ] Specificity: Does the headline match the actual onboarding task from the brief?
- [ ] Restraint: Are there ≤3 input fields? Is there exactly one primary action?
- [ ] Completeness: Is there a back/skip option? Is there a progress indicator?
- [ ] P0: Maximum 3 input fields — split into multiple steps if more are needed
- [ ] P0: Step must include a progress indicator — users must know where they are in the flow

## Example prompts
- "Onboarding step 2 of 4 for a project management tool: invite your team members (email inputs)"
- "Onboarding step 1: choose your role — Developer, Designer, Product Manager (option cards)"
- "Setup step: connect your GitHub account — single OAuth button, skip option"
