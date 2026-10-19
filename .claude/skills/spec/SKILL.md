---
name: spec
description: Align on a feature before building it — explore read-only, interview the user, then write docs/specs/<feature>.md.
argument-hint: [feature]
arguments:
  - feature
disable-model-invocation: true
---

Write a spec for: $feature

1. Explore the relevant code read-only. Start from the closest feature slice (`features/visits/` is the reference) and note which zone (AGENTS.md "Quick reference") each touched area is in.
2. Interview the user **one question at a time**. Each question comes with your recommended answer and a one-line reason. Wait for the reply before asking the next.
3. Cover, as relevant: behaviour, UI states (loading / empty / error / success), edge cases, accessibility (AGENTS.md §13), data and schema changes, permissions (`admin` vs `viewer`, `requireAdmin()` vs `requireUser()`), i18n (`cs.json` + `en.json`), E2E mock impact.
4. Do not edit code. The only file you write is `docs/specs/<feature>.md` (kebab-case), with these sections:
   - **Goal**
   - **Scope**
   - **Out of scope**
   - **Files & interfaces** — files to create/change, types, action signatures
   - **Tasks** — vertical slices (each one shippable and testable end to end), numbered, each with `Blocked by: <task numbers | none>` and its zone
   - **Testing** — which layer each behaviour is tested at (schema, mapper, action, hook, component, E2E)
   - **End-to-end check** — the manual or Playwright steps that prove the feature works
5. Red-zone tasks (migrations, auth, RLS, demo login) must be flagged as needing explicit approval before implementation.
6. Finish by showing the spec path and the first unblocked task. Suggest `/next-task` to start it.
