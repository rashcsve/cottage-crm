---
paths:
  - "supabase/**"
  - "lib/auth/**"
  - "lib/supabase/**"
  - "features/**/server/**"
  - "app/api/**"
---

# Supabase, Auth, And Security

- Preserve the current security model. Do not weaken RLS, authorization checks, or role boundaries.
- `supabase/migrations/0001_initial_schema.sql` is historical and must not be edited. New schema changes belong in new migration files, and only when the user explicitly asks.
- Server mutations stay inside feature `server/mutations.ts`. Server Actions own validation, translation, auth checks, mutation-to-action mapping, and revalidation.
- Do not add API routes for normal data mutations. The only current API routes are `/api/weather` and `/api/e2e/reset`.
- Do not add role-promotion logic to application code. New users become `viewer` through the `handle_new_user` trigger.
- The intentional auth exception is tasks: `toggleTaskAction` and `deleteTaskAction` use `requireUser()` because the `tasks` policies are intentionally permissive.
- Do not introduce real credentials, real Supabase data, or hardcoded secrets into code, tests, fixtures, or docs.
