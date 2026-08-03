---
name: security-review
description: Review Chata CRM changes for Supabase, auth, RLS, secrets, and server-action risks. Use when work touches migrations, auth helpers, Supabase clients, or feature server code.
when_to_use: Trigger for security-sensitive changes, especially `supabase/`, `lib/auth/`, `lib/supabase/`, `app/api/**`, and `features/**/server/**`.
context: fork
---

Perform a read-only security review of the delegated scope.

Check for:
- authorization drift, especially bypassing `requireAdmin()` or `requireUser()`
- accidental weakening of RLS or changes that conflict with existing policy intent
- unsafe migration changes, especially edits to `supabase/migrations/0001_initial_schema.sql`
- role-promotion logic added to application code
- secrets or credentials introduced in code, tests, fixtures, or docs
- server actions that skip validation, translation ownership, or revalidation boundaries
- E2E changes that bypass the mock architecture or introduce real Supabase dependence
- task-specific auth drift from the intentional `requireUser()` exceptions for task toggle/delete

Output findings first, ordered by severity, with:
- file path
- concrete risk
- why it violates a repo invariant or creates exposure
- the smallest safe remediation

If you find no issues, say so explicitly and list residual risks or missing tests.
Do not edit files while running this skill.
