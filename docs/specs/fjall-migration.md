# Fjäll design-system migration

Design source: [`docs/design/fjall-design-spec.md`](../design/fjall-design-spec.md).
Detailed plan, inventory and decisions D1–D8: [`docs/design/fjall-migration-plan.md`](../design/fjall-migration-plan.md).
References like "plan §4.1" point at that file.

## Goal

Move the whole UI onto the Fjäll design system:
- semantic Tailwind v4 tokens only
- borderless white sheets with hairline rows
- one walnut accent
- Schibsted Grotesk for text and Spline Sans Mono for data
- status always shown as icon + text

The app must meet WCAG 2.1 AA, with 44px touch targets. Czech and English must keep working, and no existing test may be weakened.

## Scope

- Tokens, fonts and the global base layer (focus, placeholder, scroll padding).
- The app shell:
  - desktop top nav
  - mobile top bar and tab bar
  - language switcher
  - weather chip
  - avatar account menu (Headless UI `Menu`, D2)
- Shared primitives:
  - buttons and links
  - sheet (`Surface`) and row list
  - status label
  - headers, filters and toolbar
  - empty, skeleton and toast
  - form controls and check toggle
- Pages: Home (following the spec exactly), Calendar, To-dos, Supplies, Notes, Login/Signup, error and not-found.
- Landing page: a token and font pass only (D3).
- Dark mode via `prefers-color-scheme`.
- A guard test that blocks raw palette classes from coming back.
- Storybook `addon-a11y` set to blocking (D6 = b).

## Out of scope

- New data, which means no changes to `app/api/**`, the weather server or migrations (D7):
  - weather humidity, tonight's low and weather alerts
  - supply quantities
- A theme toggle (dark mode follows the OS only).
- Relayout of the landing page.
- Changes to the date-format functions. Any mismatch with "pá 23. 10." is flagged as a separate task.
- Adding `@axe-core/playwright` or any other dependency.
- E2E visual-regression baselines (`toHaveScreenshot`).
- Any change to calendar URL/history or optimistic-merge logic, or to dashboard streaming or data shape.

## Files & interfaces

### Tokens (`app/globals.css`)

`app/globals.css` gets a plain `@theme` block (not `inline`) with the spec tokens, plus these additions:
- `--text-2xs` 12px
- `--text-stat-sm` 22px and `--text-stat` 40px
- `--text-display`
- `--tracking-display`, `--tracking-heading`, `--tracking-data`
- `--container-page` 1180px
- `--radius-card` and `--radius-control` (4px)
- `--shadow-card: none`
- a `border-control` (1.5px) utility, a `focus-inset` utility and a `grid-previews` utility

A temporary legacy alias block keeps the old token names working until task 12 removes it.

### Fonts (`app/layout.tsx`)

`next/font/google` with `Schibsted_Grotesk` and `Spline_Sans_Mono`, subsets `latin` + `latin-ext`. Geist and Space Grotesk are removed from the app layout.

### New shared components

All live in `shared/ui/`, each with a `.stories.tsx`:
```ts
// StatusLabel.tsx: icon is required whenever colour carries meaning
type StatusLabelProps =
  | { tone: "danger" | "warning" | "success"; icon: LucideIcon; children: ReactNode; className?: string }
  | { tone: "neutral"; icon?: LucideIcon; children: ReactNode; className?: string };

// TextLink.tsx: accent link with trailing ArrowRight, min-h-11
interface TextLinkProps extends ComponentProps<typeof Link> { children: ReactNode }

// RowList.tsx: <ul class="divide-y divide-border"> + RowListItem (min-h-12, two-line safe)
// Skeleton.tsx: bg-muted rounded-control motion-safe:animate-pulse
// CheckToggle.tsx: <button aria-pressed>, 22px visual box, 44px hit area, pending + read-only states
interface CheckToggleProps {
  checked: boolean; label: string; pending?: boolean; readOnly?: boolean;
  readOnlyStateLabel?: string; onToggle?: () => void;
}
```

### Changed shared components

| Component | Change |
|---|---|
| `Button` | Adds `block?: boolean`. `buttonVariants()` keeps its signature. |
| `IconButton` | `"aria-label": string` becomes required. Every size has a 44px minimum. |
| `Surface` | Adds `padding?: "none" \| "default"` and `as?: "div" \| "section" \| "article"`. No border, no shadow. |
| `StatusBadge` | Becomes a re-export alias of `StatusLabel` until task 7, then is removed. |
| `FilterNav` | Underline tabs. Props unchanged. |
| `CollectionToolbar` | Props unchanged, except `eyebrow` becomes optional. The primary action label stays visible at every width. |
| `EmptyState`, `PageHeader`, `PageContent`, `PageFeedback`, `SectionHeader`, `Form/*`, `FormMessage`, `Toast` | Restyled. Props unchanged. |

### Shell

`AppNav` gets `variant: "top" | "mobile"`, which replaces `"rail"`.

### Dashboard

`features/dashboard/components/DashboardStats.tsx` replaces `DashboardSummaryCard.tsx` and `dashboardAccentStyles.ts`.

### Visits

`visit-status-badge-tone.ts` becomes the only status map and returns `{ tone, icon }`. `visit-status-tone.ts` and `VisitCard`'s `COMPACT_STRIP_TONE_CLASS` are removed.

### Guard test

`tests/design-tokens.test.ts` runs in the unit project and uses only `node:fs`. It fails on any of the following in `app/`, `features/` or `shared/`:
- raw palette classes
- `focus-visible:outline-none`
- `text-[Npx]`
- `shadow-*`
- legacy tokens

### i18n

New keys are added to `cs.json` and `en.json` together, with ICU plurals for Czech:
- the presence statement
- the stat sub-state "{count} overdue"
- visit status words (Occupied, Upcoming, Past)
- the account menu
- weather units

### Deletions (ask before each)

- `shared/ui/StatCard.tsx` and its story
- `shared/ui/page/PageSection.tsx`
- `features/dashboard/components/DashboardSummaryCard.tsx`, `dashboardAccentStyles.ts` and `DashboardEmptyState.tsx`
- `features/visits/components/calendar/shared/visit-status-tone.ts`

## Tasks

Task numbers match the plan's step numbers (plan §8).

### Checks every task must pass

- **Standard checks:** `npm run lint`, `npm run typecheck`, `npm run test:run -- --project unit`, `npm run build`.
- **E2E:** `npm run e2e` (outside the sandbox, ask first) for any task that touches a page covered by E2E.
- **Screenshots:** 360, 768 and 1280px in **cs and en**, saved under `test-results/agent/` and deleted before finishing.
- **Grep gate on the touched files.** None of these may appear:
  - raw palette classes, `bg-white`, `text-white`
  - `focus-visible:outline-none`
  - `text-[…px]`
  - `shadow-`
  - `rounded-(lg|xl|2xl|3xl|4xl)`

### 0. Characterization tests for yellow zones
- Zone: 🟡 (tests only, no production code changes)
- Blocked by: none
- Status: done
- Add tests that pin the **current** behaviour: roles, accessible names, text, hrefs and `aria-*`. **No class assertions.**
  - `shared/ui/{Button,IconButton,Surface,StatusBadge,EmptyState,FilterNav,CollectionToolbar}.test.tsx`
  - `shared/ui/Form/FormComposer.test.tsx`
  - `shared/Toast/Toast.test.tsx`
  - `features/dashboard/components/{DashboardPresenceCard,DashboardWeatherCard,DashboardPreviewCards,DashboardStatsSection}.test.tsx`, covering the empty, current-visit and next-visit cases and the links' hrefs (only the preview and stats cards have links; the presence and weather cards assert that they render none)
- Done when every new test passes against the current UI.

### 1. Tokens, fonts, base layer
- Zone: 🟢 (`app/`, `.storybook/`)
- Blocked by: 0
- Status: done
- Files: `app/globals.css`, `app/layout.tsx`, `.storybook/preview.tsx`, plus `app/[locale]/components/home/{Features,Mockup}.tsx` (faint text → `text-ink-muted`).
- Apply the type-scale override (D4) and add the global focus rule, `scroll-padding-top` and placeholder colour (plan §3).
- Remove the hard-coded body classes from `app/layout.tsx`.
- Legacy aliases:
  - `--color-nav-faint` maps to `--color-ink-muted`, not `--color-ink-faint`, because unmigrated nav uses it for text
  - `--font-display` is `var(--font-space-grotesk, var(--font-sans))`, so only the landing page gets Space Grotesk
- Known gaps, closed by later tasks:
  - the global focus outline is overridden wherever `focus-visible:outline-none` remains (each task removes it under the grep gate)
  - `placeholder:text-ink-faint` in `shared/ui/Form/formStyles.ts` and `border-strong` (`ink-faint`, 2.3:1) on inputs still fail AA (form-controls task)
- Done when:
  - every page renders in the new fonts, with Czech diacritics in the brand font
  - nothing renders broken thanks to the legacy aliases
  - the PR description includes the contrast table

### 2. App shell
- Zone: 🟢 (`app/**` UI) + 🟡 (`shared/ui/SkipToContentLink`)
- Blocked by: 1
- Status: done
- Files: plan §4.1.
- Rewrite the `AppNav.test.tsx` layout-class assertions as semantic assertions (D8):
  - landmark name
  - exactly one `aria-current="page"`
  - the full label is exposed when a short label is used
  - no `truncate`
- Add tests first for the avatar account menu: it opens, shows the name, and signs out.
- Done when:
  - the keyboard order is skip link → nav → language → avatar menu → main
  - tab labels wrap at 320px in cs
  - `e2e/login.spec.ts` passes

### 3. Primitives A: buttons, links, sheets, headers
- Zone: 🟡 `shared/ui`
- Blocked by: 0, 1
- Status: todo
- Files:
  - `Button`, `IconButton`, new `TextLink`, `Surface`, new `RowList`
  - `SectionHeader`, `page/PageHeader`, `PageContent`, `PageLayout`, `PageFeedback`
  - their stories
- Set `a11y.test` to `"error"` in `.storybook/preview.tsx` (D6).
- Fix every call site that the new required `IconButton` `aria-label` breaks.
- Done when:
  - the task 0 tests still pass
  - `npm run test:run -- --project storybook` is green (outside the sandbox, ask first)

### 4. Primitives B: status, filters, empty, skeleton, toast
- Zone: 🟡 `shared/ui`, `shared/Toast`
- Blocked by: 3
- Status: todo
- Files: new `StatusLabel` (`StatusBadge` becomes an alias), `FilterNav`, `CollectionToolbar`, `EmptyState`, new `Skeleton`, `shared/Toast/*`, stories.
- Rules to keep:
  - the Toast keeps `role="status"` / `role="alert"`
  - every control is at least 44px
- Done when the task 0 tests and the toast/undo E2E flows pass.

### 5. Forms and check toggle
- Zone: 🟡 `shared/ui`
- Blocked by: 3
- Status: todo
- Files: `shared/ui/Form/*`, `FieldLabel`, `FormMessage`, new `CheckToggle` (+ story).
- Switch `TaskToggleButton` and `ShoppingToggleButton` to `CheckToggle`, keeping their accessible names.
- The read-only state must be announced with `sr-only` text.
- Done when every `New*Form` test and the Login/Signup tests pass, and each field shows the accent focus ring plus an icon + text error.

### 6. Home (`/overview`)
- Zone: 🟡 `features/dashboard`
- Blocked by: 4, 5
- Status: todo
- Implement plan §7.1: the spec layout, two flex-wrap columns that map one-to-one onto the existing Suspense boundaries, and `DashboardStats`.
- No change to `startDashboardStreaming()` or the data shape.
- Ask before the deletions: `DashboardSummaryCard`, `dashboardAccentStyles`, `DashboardEmptyState`.
- Add the new i18n keys to cs and en.
- Done when:
  - the task 0 dashboard tests plus new layout tests pass
  - sections still stream independently
  - `login.spec` passes (h1 "Home")

### 7. To-dos (`/tasks`)
- Zone: 🟢 `features/tasks`
- Blocked by: 4, 5
- Status: todo
- Implement plan §7.3.
- Update `TaskDueDate.test.tsx`: overdue → `danger` + `TriangleAlert`, due today → `warning` + `Clock` (D8). Show the diff.
- Remove the `StatusBadge` alias once nothing imports it.
- Done when the unit tests pass and the cs screenshots show the overdue, due-today, future and done states.

### 8. Supplies (`/shopping`)
- Zone: 🟡 `features/shopping`
- Blocked by: 4, 5
- Status: todo
- Implement plan §7.4. Keep "Add item" unmounting while the composer is open.
- Done when `e2e/shopping-create-and-undo.spec.ts` passes.

### 9. Notes (`/notes`)
- Zone: 🟡 `features/notes`
- Blocked by: 4, 5
- Status: todo
- Implement plan §7.5. Before changing the gallery or upload, add characterization tests for the photo flow if they're missing.
- Done when:
  - the notes tests pass
  - the lightbox works by keyboard: arrows, Esc, and focus returns to the trigger

### 10a. Calendar: toolbar, agenda, panels, cards
- Zone: 🟢 `features/visits`
- Blocked by: 4, 5
- Status: todo
- Implement plan §7.2: the toolbar, agenda and selected-day/mobile panels, `visit/*`, and the single `{tone, icon}` status map.
- Styling only. Read `.claude/rules/visits-calendar-exceptions.md` first.
- Done when the `visits-*.spec.ts` E2E tests pass.

### 10b. Calendar: month view
- Zone: 🟢 `features/visits`
- Blocked by: 10a
- Status: todo
- Files: `month/*`, `VisitsCalendarSkeleton`.
- Timeline bars become neutral; status is not encoded by colour in the grid.
- **The button count per cell must not change**, because the tests use indexes.
- Done when the `VisitsMonthView` and `VisitsMonthDayCell` tests pass and arrow-key navigation works.

### 10c. Calendar: week view
- Zone: 🟢 `features/visits`
- Blocked by: 10a
- Status: todo
- Files: `week/*`. Keep the `data-testid`s, `data-visit-card` and the hover add button's `tabIndex={-1}`.
- Done when the `VisitsWeekView` and `VisitsWeekDayContent` tests pass.

### 11. Auth, error, not-found, landing pass
- Zone: 🟢 `app/**` UI
- Blocked by: 3, 5
- Status: todo
- Implement plan §7.6:
  - `PublicShell` drops the gradient and uses the wordmark
  - Login/Signup use the new controls
  - `PageFeedback` call sites
  - the landing page gets a token and font pass only (D3)
- Done when the Login, Signup, Hero, Closing, Header and PublicShell tests and `login.spec` pass.

### 12. Cleanup and guard
- Zone: 🟢 / 🟡 (deletions in `shared/ui`)
- Blocked by: 6, 7, 8, 9, 10b, 10c, 11
- Status: todo
- Remove the legacy aliases and the `nav-*` tokens.
- Ask before deleting `StatCard` and `PageSection`.
- Add `tests/design-tokens.test.ts`.
- Update the `AGENTS.md` conventions ("Fjäll semantic tokens only") and `context/progress-tracker.md`.
- Done when the guard passes on the repo, and fails when a `bg-stone-100` is planted temporarily (shown, then reverted).

### 13. Dark mode
- Zone: 🟢 `app/`
- Blocked by: 12
- Status: todo
- Add the dark token block from plan §5.1 and `color-scheme: light dark`, with no `dark:` variants in components.
- Done when screenshots taken with Playwright `colorScheme: "dark"` look right and the contrast table is in the PR.

## Testing

| Behaviour | Layer |
|---|---|
| Primitive semantics (roles, names, `aria-*`, required icon/label props) | Component tests (Vitest + RTL) in `shared/ui/*.test.tsx` |
| Primitive visual and a11y rules | Storybook stories plus `addon-a11y` set to `error` (storybook project, Chromium) |
| Status mapping (task due state, visit status → `{tone, icon}`) | Unit tests next to the mapping functions, plus `TaskDueDate.test.tsx` |
| Shell navigation (`aria-current`, language switch, account menu, sign out) | Component tests: `AppNav.test.tsx`, `LanguageSwitcher.test.tsx`, new `AccountMenu` test |
| Dashboard sections (empty, current and next-visit, links, overdue sub-state) | Component tests from task 0, extended in task 6 |
| Feature lists, forms and calendar keyboard navigation | Existing component tests, kept green and **not weakened** |
| Create, undo and login flows | Existing E2E (`e2e/*.spec.ts`) |
| No raw palette or legacy tokens | `tests/design-tokens.test.ts` (unit) |
| i18n parity | Existing `i18n/locales.test.ts` |

## End-to-end check

1. Run `npm run dev` and sign in (E2E mock or demo user only, never real data).
2. At 1280px in **cs** (`/`) and **en** (`/en/`), visit Home, Calendar (month, week, agenda), To-dos, Supplies and Notes. Check:
   - the 72px top nav, with the active link underlined in accent
   - borderless sheets with hairline rows
   - mono numbers and dates
   - every status shown with an icon and words
3. At 360px, repeat the same visit. Check:
   - the bottom tab bar is at least 60px tall, with the active tab in accent with its top bar
   - no label is truncated
   - Home follows the spec's mobile order
4. Keyboard only, on every page:
   - Tab through the page; each control shows the 2px walnut outline and none is hidden under the sticky header
   - complete one create and one undo flow per feature
5. Toggle the OS to dark mode and confirm every page stays readable (task 13).
6. Run `npm run e2e` and `npm run test:run` (outside the sandbox) and confirm everything is green.
