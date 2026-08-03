---
name: plan-feature
description: Produce a repo-specific implementation plan for a non-trivial Chata CRM feature or refactor.
when_to_use: Use when the user explicitly asks for a plan, when the task is cross-cutting, or when there are multiple plausible architecture paths with tradeoffs.
argument-hint: [goal]
arguments:
  - goal
disable-model-invocation: true
---

Create an implementation plan for: $goal

1. Inspect the closest existing feature slice before proposing anything.
2. Anchor the plan in this repository's architecture:
   - Server Component pages
   - `get*PageData()` loaders
   - Server Actions for mutations
   - feature-local schemas and localized messages
   - translation synchronization
   - lowest-useful-layer tests
3. Explicitly call out any impact on:
   - auth and roles
   - revalidation
   - forms and schema messages
   - `i18n/locales/cs.json` and `i18n/locales/en.json`
   - E2E mocks
   - required validation commands
4. If more than one approach is viable, present up to three options with concrete tradeoffs.
5. Output:
   - assumptions
   - recommended approach
   - ordered implementation steps
   - tests to add or update
   - validation plan
   - approvals or risks that need a pause
6. Do not edit files while running this skill.
