---
name: verify-change
description: Run Chata CRM verification and summarize what passed, failed, or was skipped. Use after non-trivial changes or when the user asks to validate work.
when_to_use: Use for repository validation after implementation work. Prefer targeted tests first when the change is narrow, then run the required full sequence unless the user explicitly asked for a quick patch.
argument-hint: [focus]
arguments:
  - focus
disable-model-invocation: true
context: fork
---

Validate the current change set for Chata CRM.

1. Inspect the changed scope with `git status --short`, `git diff --stat`, and any provided `focus` argument.
2. If the change is narrow, run the smallest useful targeted tests first.
3. Unless the user explicitly asked for a quick patch, run the required repo sequence in this order:
   - `npm run lint`
   - `npm exec tsc --noEmit`
   - `npm run test:run`
   - `npm run build`
4. Never invent commands outside `package.json`.
5. If a command fails, stop broadening the verification scope and capture the highest-signal failure.
6. Distinguish likely change-introduced failures from likely pre-existing failures when the evidence supports that call.
7. Report:
   - commands run
   - pass/fail for each
   - skipped checks and why
   - introduced-versus-pre-existing assessment
   - the next fix with the best payoff
8. If browser automation was needed, note any artifacts under `test-results/agent/`.
