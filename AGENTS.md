# AGENTS.md — AI Coding Agent Guide

This file is the source of truth for AI coding agents working in this repository, including Claude Code, Codex, and similar tools. It is fully self-contained — everything here applies regardless of which agent tool is running.

It describes the actual Chata CRM codebase. Do not treat it as a generic Next.js template. When code and this document disagree, inspect the code first, then update this document as part of the change.

Claude Code sessions additionally get path-scoped detail auto-loaded from `.claude/rules/`, plus custom skills and a `security-reviewer` subagent under `.claude/`. Those are a convenience layer on top of this document, not a replacement for it — if you're not running Claude Code, everything you need is below.

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
- Exception: in Tasks, `toggleTaskAction` and `deleteTaskAction` call `requireUser()`, not `requireAdmin()` — any authenticated user (admin or viewer) can toggle task status and delete tasks. This matches the intentionally permissive RLS policies on `tasks` (see §10).
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
  locales.ts      Supported/default locale constants
  routing.ts      next-intl routing configuration
  config.ts       Request-time locale loading
  navigation.ts   next-intl navigation helpers
  revalidation.ts Locale-aware revalidation helper

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
    index.ts                  Zod schema factories and exported schema types
    get-*-schema-messages.ts  i18n message factories for schemas
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

### Client-side state patterns

Default: keep URL state on the server. Parse `searchParams` in `page.tsx` and pass the result down as a prop (see `features/tasks` filter handling). Do not manage URL state on the client unless one of the exceptions below applies — it is simpler and has no client state to keep in sync.

Two patterns in `features/visits/application/` are deliberate exceptions, not the default to copy:

- **Manual browser history instead of `useRouter`** (`application/calendar/useVisitsCalendarBrowserState.ts`): the calendar updates `view`/`date` on nearly every click (day select, period shift). Driving those through `useRouter().push()` would trigger a server round-trip and refetch page data on every interaction. Reach for this only when a URL-reflected state change must not cause a server refetch. For anything else, use server-parsed `searchParams`.
- **Local optimistic merge against server props** (`application/useVisitsCollectionState.ts`): newly created visits are held in local state and merged with server-provided data instead of calling `router.refresh()`, because a refresh would blow away the calendar's client-only navigation/selection state. Other features (Tasks, Shopping, Notes) call `router.refresh()` after mutations and rely on the Server Component re-rendering — do that unless the feature has similar transient client UI state that a refresh would disrupt.

Claude Code: `.claude/rules/visits-calendar-exceptions.md` auto-loads this same guidance when editing `features/visits/application/**`, `features/visits/components/calendar/**`, or the visits dashboard route.

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

Reference implementation: `features/visits/schemas/`. Note: its message-factory file is named `create-visit-schema-messages.ts` (no `get-` prefix), an exception to the `get-*-schema-messages.ts` naming convention — the exported function is still `getCreateVisitSchemaMessages`. `features/tasks/schemas/get-create-task-schema-messages.ts` follows the file-naming convention exactly if you need an example of that.

Claude Code: `.claude/rules/forms-localization.md` auto-loads this same guidance (plus the form-primitive pointers in §7 below) for `features/**/components/forms/**`, `features/**/schemas/**`, `shared/ui/Form/**`, and `i18n/**`.

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
- Feature root UI components are Client Components by default because they receive server-fetched data and manage UI state — true for Visits, Tasks, Shopping, and Notes (`VisitsCalendar.tsx`, `TasksPageBody.tsx`, `ShoppingPageBody.tsx`, `NotesPageBody.tsx`).
- Exception: Dashboard's feature root, `features/dashboard/components/DashboardOverview.tsx`, is a Server Component. `app/[locale]/(dashboard)/overview/page.tsx` calls `startDashboardStreaming()` to get promises, and `DashboardOverview` wraps `Suspense` boundaries around them instead of resolving data before render. Its child sections (e.g. `DashboardPresenceSection.tsx`) are Server Components too; only the leaf `ClientWeatherCard.tsx` is client-side. Reach for this pattern only when a page benefits from Suspense-streamed sections instead of a single resolved data object — for anything else, use the Client Component root pattern. (Claude Code: `.claude/rules/dashboard-streaming.md` auto-loads this for `features/dashboard/**` and the overview route.)
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

Shared form primitives to use when building forms:

- `<TextField>` / `<TextAreaField>` (`shared/ui/Form/Field.tsx`) — labelled, error-aware input wrappers
- `<FormComposer>` / `<FormSubmitBar>` (`shared/ui/Form/FormComposer.tsx`) — slide-in panel with title, close button, and submit row
- `<FormMessage>` (`shared/ui/FormMessage.tsx` — note: outside the `Form/` subfolder) — form-level error or info message
- `applyFieldErrors` (`shared/ui/Form/applyFieldErrors.ts`) — maps `fieldErrors` from `ActionResult` back onto `useForm` fields

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

### Storybook

`vitest.config.ts` defines a second Vitest project (`storybook`) that runs `*.stories.tsx` files from `.storybook/` through `@storybook/addon-vitest` in a real Chromium instance via `@vitest/browser-playwright`. `npm run test:run` executes both the jsdom project and this Storybook project. New components under `shared/ui/` typically get a co-located `.stories.tsx` file — check sibling files (e.g. `Button.stories.tsx`) before adding a component without one.

### E2E tests

Playwright covers full user flows that are too broad for unit tests, such as login, create-and-undo, calendar navigation, and toast lifecycle.

Playwright configuration:

- Config file: `playwright.config.ts`
- Browser: Chromium only
- Workers: 1
- Test mode: `E2E_MOCKS=1`
- Server port: `3100`

E2E tests must not depend on real Supabase data. The mock layer in `lib/e2e/` is part of the test architecture and must be preserved.

Claude Code: `.claude/rules/e2e-infrastructure.md` auto-loads this section's guidance for `e2e/**`, `lib/e2e/**`, `app/api/e2e/**`, and `playwright.config.ts`.

---

## 9. Commands

Use only the commands defined in `package.json`. (The README's "Scripts" section documents a shorter subset — `dev`, `lint`, `tsc --noEmit`, `test:run`, `build` — this list is the fuller, authoritative one.)

```bash
npm run dev            # Start dev server on port 3000
npm run lint           # Run ESLint
npm exec tsc --noEmit  # Run TypeScript type-check
npm run test:run       # Run all Vitest tests once (jsdom + Storybook projects)
npm run test:watch     # Run Vitest in watch mode
npm run test:ui        # Open Vitest browser UI
npm run test:coverage  # Run Vitest with coverage thresholds enforced
npm run e2e            # Run Playwright E2E tests
npm run e2e:ui         # Run Playwright UI mode
npm run build          # Build for production
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

Claude Code: `.claude/rules/supabase-security.md` auto-loads this section's guidance for `supabase/**`, `lib/auth/**`, `lib/supabase/**`, `features/**/server/**`, and `app/api/**`. The `security-reviewer` subagent (`.claude/agents/security-reviewer.md`) and the `security-review` skill perform read-only reviews against these same invariants — use them proactively for changes in this area.

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

### Actions requiring explicit approval

Stop and request approval before:

- installing, updating, or removing dependencies,
- modifying package.json or lockfiles,
- creating or editing database migrations,
- running destructive database or Supabase commands,
- reading environment or credential files,
- deleting or moving multiple files,
- committing, pushing, merging, or deploying,
- accessing authenticated external services,
- making changes outside the requested scope.

Before running a non-obvious command, explain:

1. why it is needed,
2. whether it modifies files or data,
3. whether it uses the network,
4. what artifacts it creates.

### Browser-based verification

Use browser automation only when it verifies an acceptance criterion.

- Prefer one full-page screenshot for normal visual inspection.
- Use sequential scroll screenshots only for sticky elements,
  lazy loading, infinite scrolling, or scroll-triggered behavior.
- Do not capture real personal or production data.
- Store temporary artifacts under `test-results/agent/`.
- Do not commit temporary screenshots.
- Remove unnecessary artifacts before finishing.

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

Claude Code: the `plan-feature` skill produces a repo-specific implementation plan for non-trivial work, and the `verify-change` skill runs this validation sequence and reports pass/fail/skipped. Both are optional conveniences over the steps above, not a substitute for them.
