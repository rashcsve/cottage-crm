---
paths:
  - "shared/ui/**"
  - "features/**/components/**"
  - "app/**/components/**"
---

# Accessibility

Baseline: WCAG 2.1 AA.

- **Contrast**: text and meaningful icons need a 4.5:1 contrast ratio against their background (3:1 for large-scale text/UI components). Check new color pairings explicitly.
- **Focus**: every interactive element needs a visible focus indicator and a logical tab order. Do not remove `:focus`/`:focus-visible` outlines without an equivalent replacement.
- **Labels**: use `<TextField>`/`<TextAreaField>` (`shared/ui/Form/Field.tsx`) for form controls rather than bare inputs, per §7. Icon-only controls need an accessible name (`aria-label` or equivalent).
- **Keyboard**: every mouse interaction needs a keyboard-operable equivalent. Custom interactive components need the correct role and key handling, not just a click handler on a `<div>`.
- **No meaning by color alone**: status/priority/error states (`StatusBadge`, task priority, form validation) must be distinguishable by text, icon, or shape, not color alone.
- `jsx-a11y` (via `eslint-config-next`) and Storybook's `@storybook/addon-a11y` (currently `test: "todo"`, non-blocking) surface violations but don't enforce this bar — treat their output as a signal, not as the standard itself.
