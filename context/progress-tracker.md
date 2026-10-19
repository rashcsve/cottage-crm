# Progress Tracker

Living notes on where the project stands. Update this alongside feature work; it is not auto-generated and can go stale — cross-check against `git log` before trusting old entries.

## Status

- 2026-09-15: Added missing accessibility guidance (`AGENTS.md` §13, `.claude/rules/accessibility.md`) and this tracker. See `docs/config-review.md` for the audit that first flagged both as missing.

- 2026-10-19: AI repo setup per `AI-REPO-SETUP.md`: `typecheck` script, Vitest `unit` project name, zones/workflow quick reference in `AGENTS.md`, `/spec` `/next-task` `/review` skills + `reviewer` subagent (replacing `plan-feature`), tightened permissions, `docs/specs/`. Removed the stale `docs/config-review.md`.

## Next steps

- Trim `AGENTS.md` toward the quick reference: drop content readable from code (directory tree, naming tables).
- Characterization tests for yellow zones before changing them (`features/dashboard` and `lib/e2e` are thinnest).

## Decisions

- Accessibility rules were appended as AGENTS.md §13 (after §12) rather than inserted earlier in the document, to avoid renumbering existing sections and breaking the `(see §10)`-style cross-references already in the file.
- `jsx-a11y` (ESLint) and Storybook's `addon-a11y` already exist in the repo but only warn (`test: "todo"`); documenting the WCAG 2.1 AA bar as the standard doesn't change that enforcement — it's a separate follow-up if the team wants it blocking.
