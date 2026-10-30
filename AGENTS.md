# Project: Chata CRM

Bilingual (cs default at `/`, en at `/en/`) Next.js App Router + Supabase app for a shared family cottage: visits, shopping, tasks, notes, plus an `/overview` dashboard. Live demo: `https://cottage-crm-demo.vercel.app` (isolated Supabase — not production data).

When code and this file disagree, trust the code and update this file in the same change.

## Commands

- Dev: `npm run dev` (port 3000)
- Test all: `npm run test:run` · unit only: `npm run test:run -- --project unit` · one file: `npm run test:run -- --project unit <path>`
- Typecheck: `npm run typecheck` · Lint: `npm run lint` · E2E: `npm run e2e` · Build: `npm run build`
- No formatter (no Prettier). Use only scripts that exist in `package.json`.
- Before calling a change done: lint, typecheck, `test:run`, build. If a check fails for a pre-existing reason, say so — don't skip it silently.

## Conventions (non-default)

- Roles live in `public.profiles`: `admin` creates/deletes, `viewer` reads. New users become `viewer` via the `handle_new_user` trigger; promotion is manual in the Supabase dashboard — never in app code.
- Couples live in `public.couples` (fixed ids `couple-1`…`couple-4` and `admin`). Labels and `profiles.couple` are set manually in the Supabase dashboard, like roles — a trigger blocks changing `couple` through the authenticated client. Never in app code.
- Reads: `page.tsx` (Server Component) → `get*PageData()` (`server-only`) → `queries.ts` → props into the feature's root Client Component. Don't fetch domain data from Client Components.
- URL state: parse `searchParams` in `page.tsx` and pass it down (see `features/tasks` filters). Don't manage URL state on the client. To switch a filter view instantly, `useOptimisticNavigation` (`shared/hooks/`) may overlay the parsed value until the pushed page arrives — call it from a `<Link>`'s `onNavigate`.
- Writes: Client Component → Server Action in `server/actions.ts` → build localized Zod schema → validate → `requireAdmin()`/`requireUser()` → `mutations.ts` → feature `revalidation.ts`. No API routes for mutations.
- `mutations.ts` returns `MutationResult<T>` with typed failures, never user-facing strings; actions translate and return `ActionResult<T>` (`lib/types/`). Mutations take the Supabase client as a parameter.
- Add forms don't call `router.refresh()`: the action's `revalidatePath` returns the fresh page. Optimistic deletes run `useOptimisticRemoveList` in the feature's page body (not the list), filter each server group with `isRemoved`, and derive every count from the filtered groups' `.length` (see `ShoppingPageBody`, `features/visits/application/useVisitsCollectionState.ts`). They call `router.refresh()` after the commit, and toggles stay server-confirmed (action, then `router.refresh()`).
- Mobile add sheets (a `MobileActionBar` button opening a form): use `<QuickAddBar>` (`shared/ui/`), which wires `useQuickAddSheet`, `<AddItemFormPanel>` (panel + `FormLoadBoundary` + mount-only-while-open) and `<QuickAddAnnouncer>`. Pass `children(headerTrigger)` to also place the button in a desktop header, and `skeleton` for a form skeleton. The feature keeps only its labels and lazy (`dynamic`) form in a thin wrapper (see `ShoppingQuickAddBar`, `TaskQuickAddBar`, `NoteQuickAddBar`). The form reports success through `onAdded`, not a toast, so the add is announced once. Visits predates this and still wires `AddItemPanel` by hand; if you move it, extend `AddItemFormPanel` with the props it needs (`modal`) instead of adding a second wrapper.
- Zod schemas are factories taking injected messages from `get-*-schema-messages.ts` — never hardcode validation text. Mappers validate DB rows with Zod; parse all external data (`unknown` first).
- Forms: `react-hook-form` + `zodResolver`, schema built in `useMemo`, `mode: "onBlur"`, server `fieldErrors` via `applyFieldErrors`, form-level errors via `setError("root")` + `<FormMessage>`. Use `<TextField>`/`<TextAreaField>`, not bare inputs.
- Keep `i18n/locales/cs.json` and `en.json` in sync in every change.
- Shared code goes in `shared/` only when two or more features need it. Before writing UI or logic, check `shared/` (and Storybook) for an existing piece. When a second feature needs the same *behaviour* (state, focus, a11y, announcements, loading/error handling), extract it to `shared/` instead of copying. Markup that only looks alike, or that already differs between callers, stays in the features until a third use shows what is really shared. Extend an existing shared piece with a prop rather than adding a near-duplicate.
- No `any`, `@ts-ignore`, `@ts-expect-error`, or weakening `strict`. Use `never` exhaustiveness checks on growing unions.
- No nested ternaries for computing values: return early for the special case, then build optional parts in an array and `join` them (see `features/tasks/components/TasksHeaderSummary.tsx`). Name repeated class strings and separators as module-level `UPPER_CASE` constants.
- Styling: Fjäll semantic tokens only (`app/globals.css`, spec `docs/design/fjall-design-spec.md`). No raw palette classes (incl. `bg-white`/`text-white`), `focus-visible:outline-none`, `text-[Npx]` or `shadow-*`; `tests/design-tokens.test.ts` enforces this in `app/`, `features/`, `shared/`. Status is always icon + text via `StatusLabel`; a visit's couple is always shown with its text label (`VisitCoupleLabel`), never by color alone.

## Follow these examples

- Feature slice: `features/visits/`
- Form: `features/visits/components/forms/NewVisitForm.tsx`
- Schema + messages: `features/tasks/schemas/` (`get-create-task-schema-messages.ts`)
- Mapper: `features/visits/server/mappers.ts`
- Mobile add sheet: `features/shopping/components/ShoppingQuickAddBar.tsx` (integration test with the real form: `ShoppingQuickAddBar.integration.test.tsx`)
- Action tests: `features/visits/server/actions.test.ts` (translator mock: `tests/utils/create-translator-mock.ts`)
- New `shared/ui/` component: co-locate a `.stories.tsx` (see `Button.stories.tsx`)

## Gotchas

- Tasks toggle/delete use `requireUser()`, not `requireAdmin()`, on purpose — matches the intentionally permissive `tasks` RLS. Don't "fix" it.
- Visits calendar exceptions — don't copy elsewhere: it writes `view`/`date` with manual browser history (not `useRouter`) so clicks don't refetch server data, and merges newly created visits optimistically instead of `router.refresh()` so calendar selection isn't wiped.
- Dashboard's root `DashboardOverview.tsx` is the only Server Component feature root: `overview/page.tsx` calls `startDashboardStreaming()` and sections stream through `Suspense`; only `ClientWeatherCard.tsx` is client-side.
- The visits schema-messages file is `create-visit-schema-messages.ts` (no `get-` prefix) — a naming exception.
- Visits and couples: new visits must have a couple (`require_visit_couple` trigger), but older visits may have `couple = NULL`. Handle it via `features/visits/domain/couples.ts`. The database rejects overlapping stays for the same couple (`visits_couple_no_overlap`, `admin` exempt). `mutations.ts` maps `23P01` to `conflict`, and the E2E mock in `lib/e2e/mock-data.ts` copies that check. Keep the two in sync.
- E2E runs against the mock layer in `lib/e2e/` (`E2E_MOCKS=1`, port 3100, 1 worker). Never mix real Supabase data into E2E or remove the mock layer.
- The `storybook` Vitest project and Playwright launch Chromium, which can't start in Claude Code's macOS sandbox. In the sandbox run `--project unit`; ask before running the full suite or E2E outside it.
- Demo mode (`NEXT_PUBLIC_DEMO_MODE=1`, demo deployment only, must default off): unauthenticated visitors are signed in as a real seeded user via `app/api/demo/session/route.ts` (rate-limited, navigation-only). It's a normal session — RLS and auth helpers apply. The home page is excluded so sign-out doesn't loop.

## Zones

- 🟢 **Green** (work freely, tests required): `features/visits`, `features/tasks`, `i18n/`, `lib/utils`, `app/**` UI components.
- 🟡 **Yellow** (write characterization tests BEFORE changing): `features/shopping`, `features/notes` (photo uploads), `features/dashboard`, `shared/ui`, `lib/e2e`.
- 🔴 **Red** (ask before every change): `supabase/migrations`, `lib/auth`, `lib/supabase`, `lib/demo` and `app/api/demo`, `app/api/**`, `proxy.ts`, `requireAdmin()`/`requireUser()` calls in `features/**/server/actions.ts`, `.github/workflows`, `package.json` and the lockfile, agent config (`.agents/`, `.claude/`, `.codex/`, `.husky/`).

## Security

- All tables have RLS. Never remove, bypass, or weaken a policy; match the existing model (e.g. `visits` insert is admin-only and author-only since migration 0006, matching `requireAdmin()` in `createVisitAction`; `visits` delete is author-only).
- Schema changes go in new migration files, only on explicit request. Never edit applied migrations.
- Never bypass `requireAdmin()` on admin-only mutations or remove `"server-only"` from server modules.
- Never read or print `.env*`; never commit or hardcode credentials (real or demo) in code, tests, fixtures, or docs.

## Accessibility (WCAG 2.1 AA)

- Contrast 4.5:1 for text and meaningful icons (3:1 for large text/UI components).
- Visible focus on every interactive element, logical tab order; don't remove outlines without a replacement.
- Every control has a programmatic label; icon-only controls get an accessible name.
- Every mouse interaction has a keyboard equivalent; custom controls need a role and key handling.
- Never convey status/priority/errors by color alone.
- `jsx-a11y` only warns; Storybook's `addon-a11y` fails stories (`test: "error"`). This list is the bar, not them.

## Workflow

- Explore read-only first; for bigger changes, propose a plan and wait. Specs live in `docs/specs/`; move shipped ones to `docs/specs/done/` (or delete them).
- Manual skills in `.agents/skills/` (shared by Claude Code and Codex): `spec` → `next-task` → `review-spec` (run in a fresh session). Edit skills there, not in tool folders.
- Small steps. One task at a time. Make the smallest change that solves it.
- Test by risk, at the lowest useful layer (E2E only for full flows). Write a test only if it would fail for a bug a user would notice:
  - Tests first: domain logic, Zod schemas, mappers, server actions (auth/roles), optimistic/state hooks, and a regression test for every bug fix.
  - Test lightly: interactive components and forms — happy path plus meaningful error paths, asserted by role and text, not class names or DOM structure.
  - Don't unit-test: static/marketing components, styling, class names, animation timings, loading skeletons, thin wrappers, Next.js plumbing (covered by typecheck, `tests/design-tokens.test.ts`, Storybook a11y, E2E).
- Never delete, skip or weaken a test to make it pass — ask.
- After changing a page's layout or sections, update its `loading.tsx` and Suspense skeletons in the same change so content doesn't jump on load.
- After changes run typecheck + relevant tests + lint; fix root causes (no disabled lint rules).
- Show evidence: the command you ran and its output.
- Don't commit. Suggest a Conventional Commit message (what + why) referencing the spec task; the user reviews and commits. Never suggest committing failing tests.
- Ask before: adding/updating/removing dependencies, touching `package.json`/lockfile, migrations, destructive DB/Supabase commands, deleting or moving multiple files, push/merge/deploy, authenticated external services, out-of-scope changes.
- Before a non-obvious command, say why, whether it modifies files/data, uses the network, and what artifacts it creates.
- Browser checks only to verify an acceptance criterion; no real personal data; artifacts in `test-results/agent/`, never committed, removed before finishing.
- If what you find contradicts the plan, stop and say so.
