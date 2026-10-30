---
name: review-spec
description: Fresh-context review of the current diff against its spec in docs/specs/.
argument-hint: [spec-file]
disable-model-invocation: true
context: fork
agent: reviewer
---

Run this in a fresh session (Claude Code forks into the `reviewer` subagent automatically), so the reviewer did not write the code. Do not edit files.

Review the current change set against the spec the user named when invoking this skill (if none, find the spec in `docs/specs/` that matches the changed files; if none, review against AGENTS.md alone and say so).

Collect the diff with `git status --short`, `git diff`, and `git diff --cached`. Read untracked files too.

Report **only**:
- missing requirements (spec says X, diff doesn't do X)
- untested edge cases
- bugs
- security issues: XSS, secrets, auth enforced only on the client, missing `requireAdmin()`/`requireUser()`, RLS weakening
- accessibility problems (AGENTS.md "Accessibility")
- loading states out of sync: for UI changes to a page or Suspense section, compare its `loading.tsx` and skeletons (layout gaps, section order, row count/height, static controls like action buttons) with the changed markup
- scope creep (changes the spec doesn't ask for)
- weakened, skipped, or deleted tests

No style nitpicks. Every finding gets a `file:line` reference and a one-line fix. If a category has nothing, omit it; if there are no findings at all, say so plainly.
