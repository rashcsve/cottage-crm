---
name: next-task
description: Implement exactly one unblocked task from a spec in docs/specs/, tests first.
argument-hint: [spec-file]
disable-model-invocation: true
---

Implement the next task from the spec the user named when invoking this skill (if none, list `docs/specs/*.md` and ask which one).

Do not commit. The user commits after review. When the task is complete, suggest a Conventional Commit message that describes what changed and why, and references the spec filename and task number.

1. Read the spec. Pick the lowest-numbered task whose `Blocked by` tasks are all marked done. Say which task you picked and why.
2. If the task is in a red zone, stop and ask for approval before touching anything.
3. Write failing tests first, at the lowest useful layer (AGENTS.md "Workflow"). Run them (`npm run test:run -- --project unit <file>`) and show that they fail for the expected reason.
4. **Stop and wait** for the user to check the tests.
5. After approval, implement until the tests pass. Follow the patterns named in the spec and AGENTS.md; no `any`, `@ts-ignore`, or disabled lint rules.
6. Run and show output of:
   - `npm run typecheck`
   - the relevant tests (`npm run test:run -- --project unit <paths>`)
   - `npm run lint`
7. Mark the task as done in the spec (`Status: done`).
8. Stop. Do not start the next task. Suggest running the `review-spec` skill in a fresh session.
