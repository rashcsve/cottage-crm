# AGENTS.md — AI Coding Agent Guide

This file is the source of truth for AI coding agents working in this repository, including Claude Code, Codex, and similar tools.

It describes the actual Chata CRM codebase. Do not treat it as a generic Next.js template. When code and this document disagree, inspect the code first, then update this document as part of the change.

---

## 1. Project Overview

**Chata CRM** is a bilingual Czech / English Next.js portfolio application for managing shared cottage operations.

The app has four primary domains:

| Domain       | Purpose                                                                    |
| ------------ | -------------------------------------------------------------------------- |
| **Visits**   | Tracks date ranges when family members stay at the cottage                 |
| **Shopping** | Maintains a shared grocery and supply checklist with authorship            |
| **Tasks**    | Tracks maintenance and household work with priority, status, and due dates |
| **Notes**    | Stores freeform notes with optional photo attachments                      |

The authenticated dashboard at `/overview` aggregates statistics and weather information across the app.

Authentication is role-based:

- `admin` users can create and delete records.
- `viewer` users can read data.
- User roles are stored in `public.profiles`.
- New users are created as `viewer` by the `handle_new_user` database trigger.
- Promotion from `viewer` to `admin` is manual and must be done in the Supabase dashboard.

A live demo is available at `https://cottage-crm-demo.vercel.app`. It uses an isolated Supabase instance and must not be treated as production data.

---

## 2. Architecture

### Directory layout

```txt
app/
  [locale]/
    (dashboard)/  Authenticated routes: overview, visits, shopping, tasks, notes
    (public)/     Public routes: login, signup
    components/   App-shell components, such as AppNav and LanguageSwitcher
    layout.tsx    Root locale layout

features/
  visits/
  shopping/
  tasks/
  notes/
  dashboard/

shared/
  ui/             Stateless UI primitives: Button, StatusBadge, PageLayout, Form/*
  Toast/          Toast provider, hook, and types
  hooks/          Shared client hooks

lib/
  auth/           requireAdmin, requireUser, getCurrentProfile, AuthError
  supabase/       Server and browser Supabase clients
  types/          Shared generic result types
  utils/          Date helpers and validation utilities
  e2e/            E2E mock wiring: mock mode, mock data, mock auth
  routes.ts       Typed route constants

i18n/
  locales/        cs.json, en.json
  routing.ts      next-intl routing configuration
  config.ts       Request-time locale loading

supabase/
  migrations/     SQL migrations

e2e/              Playwright specs
tests/            Vitest setup, utilities, and fixtures
```

### Feature slice structure

Each domain feature follows the same structure. Use `features/visits/` as the canonical reference.

```txt
features/<domain>/
  components/
    forms/            Client form components
  schemas/
    index.ts          Zod schema factories and exported schema types
    get-*-messages.ts i18n message factories for schemas
  server/
    actions.ts        "use server" entry points called by Client Components
    mutations.ts      "server-only" database writes
    queries.ts        "server-only" database reads
    mappers.ts        Row-to-domain mapping with Zod validation
    get-*-page-data.ts Page-level data assembly
    revalidation.ts   Feature-owned revalidatePath calls
  types/
    <domain>.ts       Domain interfaces and enums
    actions.ts        Feature-specific action result types
  shared/             Feature-internal utilities
  domain/             Pure business logic — present in visits, tasks, dashboard
  application/        Client-side application state hooks — present in visits only
```

Feature folders should remain self-contained. Shared abstractions belong in `shared/` only when at least two features need them.

---

## 3. Data Flow

### Reading data

Use this pattern for page data:

1. `app/[locale]/(dashboard)/<page>/page.tsx` is a Server Component.
2. The page calls `get*PageData()` from `features/<domain>/server/`.
3. `get*PageData()` is marked `"server-only"`.
4. It calls auth helpers and `queries.ts`.
5. It assembles a typed page data object.
6. The page passes that data into the feature root Client Component.

Do not fetch domain data directly from Client Components unless the existing code already uses that pattern for a specific client-side-only concern.

### Writing data

All domain mutations go through Server Actions.

1. A Client Component calls an action from `features/<domain>/server/actions.ts`.
2. The action builds the localized Zod schema using `getTranslations`.
3. The action validates input.
4. The action checks authorization with `requireAdmin()` or `requireUser()`.
5. The action calls `mutations.ts`.
6. The mutation returns `MutationResult<T>`.
7. The action maps the mutation result to `ActionResult<T>`.
8. The action calls the feature's `revalidation.ts` helper.
9. The client receives:

```ts
{ ok: true; data?: T; message?: string } | {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
}
```

Mutations should return typed failure results, not user-facing strings. Actions own translation and user-facing error messages.

### Supabase clients

- Server code uses `lib/supabase/server.ts` → `createClient()`.
- Browser code uses `lib/supabase/client.ts` → `getBrowserSupabaseClient()`.
- `getBrowserSupabaseClient()` is a singleton around `createBrowserClient` from `@supabase/ssr`.
- Mutations receive the Supabase client as a parameter. Callers own client creation; mutations own database logic.

### API routes

Only two API routes currently exist:

- `/api/weather/route.ts` — client-side weather fetch
- `/api/e2e/reset/route.ts` — E2E test helper

Do not add API routes for normal data mutations. Use Server Actions instead.

---

## 4. Localization

The app uses `next-intl`.

- Supported locales: `cs`, `en`
- Default locale: `cs`
- Locale prefix strategy: `localePrefix: "as-needed"`
- Czech is served at `/`
- English is served at `/en/`
- Locale detection is disabled with `localeDetection: false`
- Users switch locale through `LanguageSwitcher`

Core files:

- `i18n/locales.ts`
- `i18n/routing.ts`
- `i18n/config.ts`
- `i18n/locales/cs.json`
- `i18n/locales/en.json`

Translation usage:

- Server-side: `getTranslations("namespace")` from `next-intl/server`
- Client-side: `useTranslations("namespace")` from `next-intl`

Keep `cs.json` and `en.json` synchronized whenever adding or changing translation keys.

### Zod schema localization

Zod error messages must not be hardcoded.

Use this pattern:

1. Define schemas as factory functions in `features/<domain>/schemas/index.ts`.
2. Define message factories in `get-*-schema-messages.ts`.
3. Inject translated messages when constructing the schema.

Example pattern:

```ts
const schema = createVisitSchema(getCreateVisitSchemaMessages(t));
```

Reference implementation: `features/visits/schemas/`.

---

## 5. TypeScript and Code Conventions

### TypeScript rules

- `tsconfig.json` has `"strict": true`; do not weaken it.
- Do not use `any`.
- Use `unknown` for untrusted external data.
- Parse database rows, API responses, and other external data with Zod before use.
- Mapper functions must validate rows before returning domain types.
- Use shared result types consistently:
  - `ActionResult<T>` from `lib/types/actions.types.ts`
  - `MutationResult<T>` from `lib/types/mutations.types.ts`
- Use exhaustiveness checks in switches where a union can grow.

Example:

```ts
const _exhaustive: never = value;
```

### Naming conventions

| Item                     | Convention                 | Example                              |
| ------------------------ | -------------------------- | ------------------------------------ |
| React components         | PascalCase, `.tsx`         | `VisitsCalendar.tsx`                 |
| Hooks                    | `use` prefix, camelCase    | `useVisitsCalendarState.ts`          |
| Page data loaders        | kebab-case                 | `get-visits-page-data.ts`            |
| Schema message factories | `get-*-schema-messages.ts` | `get-create-task-schema-messages.ts` |
| Domain type files        | Singular or domain noun    | `visits.ts`, `tasks.ts`              |
| Feature utilities        | camelCase                  | `formatVisitDate.ts`                 |
| Pure domain logic files  | kebab-case                 | `visit-status.ts`                    |

### Import paths

`@/*` maps to the repository root.

Use aliases for app code:

```ts
import { Button } from "@/shared/ui/Button";
import { getVisitsPageData } from "@/features/visits/server/get-visits-page-data";
```

Avoid fragile long relative imports across feature boundaries.

---

## 6. Server and Client Component Rules

The component boundary rules are strict:

- `page.tsx` files are Server Components.
- Layouts are Server Components.
- Components using state, effects, browser APIs, or event handlers must include `"use client"`.
- Feature root UI components are always Client Components because they receive server-fetched data and manage UI state.
- Server Actions are called directly from Client Components.
- Pure display components can be Server or Client Components. Check the file before changing the boundary.

Do not move data fetching into Client Components just to simplify prop passing. Preserve the Server Component page-data pattern unless there is a clear reason to change it.

---

## 7. Forms

All forms use `react-hook-form` with Zod through `@hookform/resolvers/zod`.

Required pattern:

1. Define the schema as a factory function in `features/<domain>/schemas/index.ts`.
2. Inject localized schema messages through `get-*-schema-messages.ts`.
3. Build the schema inside the form with `useMemo`.
4. Initialize `useForm` with `zodResolver(schema)`.
5. Use `mode: "onBlur"` unless there is a specific reason not to.
6. On submit, call the appropriate Server Action.
7. Apply returned `fieldErrors` with `applyFieldErrors`.
8. Use `setError("root", ...)` for form-level errors.
9. Display form-level errors with `<FormMessage>`.

Shared form primitives from `shared/ui/Form/` to use when building forms:

- `<TextField>` / `<TextAreaField>` — labelled, error-aware input wrappers
- `<FormComposer>` / `<FormSubmitBar>` — slide-in panel with title, close button, and submit row
- `<FormMessage>` — form-level error or info message
- `applyFieldErrors` — maps `fieldErrors` from `ActionResult` back onto `useForm` fields

Reference: `features/visits/components/forms/NewVisitForm.tsx`.

Do not duplicate field-error mapping logic inside individual forms.

---

## 8. Testing

### Unit tests

Vitest tests should cover:

| Layer               | What to test                                                  | Examples                                              |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| `domain/`           | Pure logic                                                    | `visit-status.test.ts`, `task-categorization.test.ts` |
| `schemas/`          | Valid input, invalid input, boundaries, cross-field rules     | `features/visits/schemas/index.test.ts`               |
| `server/mappers.ts` | Row-to-domain mapping and validation                          | `features/visits/server/mappers.test.ts`              |
| `shared/` utilities | Date formatting, photo validation, reusable helpers           | `formatVisitDate.test.ts`                             |
| `server/actions.ts` | Auth, validation failures, mutation success and failure paths | `features/visits/server/actions.test.ts`              |
| `shared/hooks/`     | Hook state transitions                                        | `useOptimisticRemoveList.test.tsx`                    |
| Components          | Rendering and user interactions with mocked server actions    | `NoteItem.test.tsx`, `LoginForm.test.tsx`             |

Vitest runs in jsdom. Global setup is in `tests/setup.ts`.

Useful test helpers:

- `tests/utils/create-translator-mock.ts`
- `tests/fixtures/task-fixtures.ts`

Coverage thresholds in `vitest.config.ts`:

- 75% lines
- 75% functions
- 75% statements
- 70% branches

### E2E tests

Playwright covers full user flows that are too broad for unit tests, such as login, create-and-undo, calendar navigation, and toast lifecycle.

Playwright configuration:

- Config file: `playwright.config.ts`
- Browser: Chromium only
- Workers: 1
- Test mode: `E2E_MOCKS=1`
- Server port: `3100`

E2E tests must not depend on real Supabase data. The mock layer in `lib/e2e/` is part of the test architecture and must be preserved.

---

## 9. Commands

Use only the commands defined in `package.json` and documented in the README.

```bash
npm run dev           # Start dev server on port 3000
npm run lint          # Run ESLint
npm exec tsc --noEmit # Run TypeScript type-check
npm run test:run      # Run all Vitest tests once
npm run test:watch    # Run Vitest in watch mode
npm run test:ui       # Open Vitest browser UI
npm run e2e           # Run Playwright E2E tests
npm run e2e:ui        # Run Playwright UI mode
npm run build         # Build for production
```

Before considering a change complete, run:

```bash
npm run lint
npm exec tsc --noEmit
npm run test:run
npm run build
```

If a check fails because of a pre-existing issue, document the failure clearly. Do not silently skip checks.

---

## 10. Database and Security Rules

### Migrations

- Do not create, edit, or delete files in `supabase/migrations/` without an explicit user request.
- Do not modify `0001_initial_schema.sql` after it has been applied.
- Schema changes must be made through new migration files unless the user explicitly asks otherwise.

### Row Level Security

All tables have RLS enabled.

Do not remove, bypass, weaken, or simplify RLS policies.

Existing policy intent matters:

- `visits` delete is restricted to the author: `auth.uid() = author_id`
- Other tables are more permissive where the current schema intentionally allows that

When adding tables or policies, match the current security model instead of inventing a new one.

### Auth and roles

- Do not add application code for role promotion.
- Do not bypass `requireAdmin()` for admin-only mutations.
- Do not duplicate the `handle_new_user` trigger in application code.
- Do not assume a user profile exists without using the existing auth/profile helpers.

### Demo and secrets

- The demo app uses an isolated Supabase project.
- Do not commit real Supabase credentials.
- Do not commit demo Supabase credentials.
- Do not hardcode secrets in tests, fixtures, or documentation.

---

## 11. Agent Guardrails

Do not do any of the following unless explicitly requested:

- Add API routes for data mutations
- Move mutation logic from Server Actions to API routes
- Bypass `requireAdmin()` or `requireUser()`
- Remove `"server-only"` from server modules
- Introduce `any`, `as any`, `// @ts-ignore`, or `// @ts-expect-error`
- Weaken TypeScript strictness
- Hardcode Zod validation messages
- Edit Supabase migrations casually
- Remove or bypass the E2E mock layer
- Mix real Supabase data into E2E tests
- Commit credentials or environment secrets
- Leave translation files out of sync
- Invent commands not present in `package.json`

When unsure, inspect the existing implementation in the closest feature and follow that pattern.

---

## 12. Change Workflow

For any non-trivial change:

1. Inspect the existing feature pattern first.
2. Make the smallest change that solves the task.
3. Keep Server Component, Server Action, and mutation boundaries intact.
4. Add or update tests at the lowest useful layer.
5. Keep translations synchronized.
6. Run the required checks.
7. Report what changed and which checks were run.

Preferred order for validation:

```bash
npm run lint
npm exec tsc --noEmit
npm run test:run
npm run build
```

If the user asks for a quick patch and there is no time to run every check, be explicit about which checks were not run and why.
