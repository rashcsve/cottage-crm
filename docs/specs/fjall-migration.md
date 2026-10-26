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
  | {
      tone: "danger" | "warning" | "success";
      icon: LucideIcon;
      children: ReactNode;
      className?: string;
    }
  | {
      tone: "neutral";
      icon?: LucideIcon;
      children: ReactNode;
      className?: string;
    };

// TextLink.tsx: accent link with trailing ArrowRight, min-h-11
interface TextLinkProps extends ComponentProps<typeof Link> {
  children: ReactNode;
}

// RowList.tsx: <ul class="divide-y divide-border"> + RowListItem (min-h-12, two-line safe)
// Skeleton.tsx: bg-muted rounded-control motion-safe:animate-pulse
// CheckToggle.tsx: <button aria-pressed>, 22px visual box, 44px hit area, pending + read-only states
interface CheckToggleProps {
  checked: boolean;
  label: string;
  pending?: boolean;
  readOnly?: boolean;
  readOnlyStateLabel?: string;
  onToggle?: () => void;
}
```

### Changed shared components

| Component                                                                                                    | Change                                                                                                       |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `Button`                                                                                                     | Adds `block?: boolean`. `buttonVariants()` keeps its signature.                                              |
| `IconButton`                                                                                                 | `"aria-label": string` becomes required. Every size has a 44px minimum.                                      |
| `Surface`                                                                                                    | Adds `padding?: "none" \| "default"` and `as?: "div" \| "section" \| "article"`. No border, no shadow.       |
| `StatusBadge`                                                                                                | Becomes a re-export alias of `StatusLabel` until every feature has moved off it, then is removed in task 12. |
| `FilterNav`                                                                                                  | Underline tabs. Props unchanged.                                                                             |
| `CollectionToolbar`                                                                                          | Props unchanged, except `eyebrow` becomes optional. The primary action label stays visible at every width.   |
| `EmptyState`, `PageHeader`, `PageContent`, `PageFeedback`, `SectionHeader`, `Form/*`, `FormMessage`, `Toast` | Restyled. Props unchanged.                                                                                   |

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
- Status: done
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
- Status: done
- Files: new `StatusLabel` (`StatusBadge` becomes an alias), `FilterNav`, `CollectionToolbar`, `EmptyState`, new `Skeleton`, `shared/Toast/*`, stories.
- Rules to keep:
  - the Toast keeps `role="status"` / `role="alert"`
  - every control is at least 44px
- Done when the task 0 tests and the toast/undo E2E flows pass.

### 5. Forms and check toggle

- Zone: 🟡 `shared/ui`
- Blocked by: 3
- Status: done
- Files: `shared/ui/Form/*`, `FieldLabel`, `FormMessage`, new `CheckToggle` (+ story).
- Switch `TaskToggleButton` and `ShoppingToggleButton` to `CheckToggle`, keeping their accessible names.
- The read-only state must be announced with `sr-only` text.
- Also moves the Shopping "Return to list" action variant of `ShoppingToggleButton` onto `Button variant="secondary"` (spinner `motion-safe:`), since it lives in the same component.
- Done when every `New*Form` test and the Login/Signup tests pass, and each field shows the accent focus ring plus an icon + text error.

### 6. Home (`/overview`)

- Zone: 🟡 `features/dashboard`
- Blocked by: 4, 5
- Status: done
- Implement plan §7.1: the spec layout, two flex-wrap columns that map one-to-one onto the existing Suspense boundaries, and `DashboardStats`.
- No change to `startDashboardStreaming()` or the data shape.
- Ask before the deletions: `DashboardSummaryCard`, `dashboardAccentStyles`, `DashboardEmptyState`.
- Add the new i18n keys to cs and en.
- **Desktop fits one screen** (amends plan §7.1): at `lg`+ Home fits a 1440×900 viewport without vertical scrolling, with typical data (measured before the change: 79px over at 1440×900, 259px at 1280×720). Mobile and tablet keep scrolling in the spec order.
  - At `xl`, notes, to-dos and supplies sit side by side in one 3-column row.
  - Desktop previews show at most 2 to-dos, 2 supplies and 1 note (presentation only; `domain/overview.ts` limits unchanged). Mobile keeps 3 / 3 / 2.
  - Presence lists at most 2 current visitors, then "+N more".
  - Presence statement is count-free, because visitor names are free text and often a group ("Anna and Tom"): "Here now: {names}." / "Teď na chatě: {names}.". The separate "Occupied" `StatusLabel` is dropped; the empty statement stays "Nobody right now."
  - Home hides the page description at `lg`, uses 24px gaps, and the weather card is compact ("Updated" moves next to the location).
  - No `h-screen` + `overflow-hidden` and no scrolling inside cards: at 200% zoom or with unusual data the page scrolls normally (WCAG 1.4.10).
- Done when:
  - the task 0 dashboard tests plus new layout tests pass
  - sections still stream independently
  - `login.spec` passes (h1 "Home")
  - screenshots at 1440×900 (en and cs) show no vertical scroll with the E2E mock data

### 7. To-dos (`/tasks`)

- Zone: 🟢 `features/tasks`
- Blocked by: 4, 5
- Status: done (cs screenshots pending; cs pages are reachable since the 2026-10-26 `proxy.ts` login-redirect fix)
- Implement plan §7.3.
- Update `TaskDueDate.test.tsx`: overdue → `danger` + `TriangleAlert`, due today → `warning` + `Clock` (D8). Show the diff.
- Remove the `StatusBadge` alias once nothing imports it.
  - Deferred: shopping, visits, notes and the `SectionHeader`/`StatusBadge` stories still import it, so it goes in task 12 once tasks 8, 9 and 10a have moved off it. To-dos and `CollectionToolbar` no longer import it.
- `CollectionToolbar` summary items and `countTone` take `StatusLabelTone` (adds `danger`), so the To-dos overdue summary matches the danger rows (approved 2026-10-21).
- Deviations from plan §7.3 (approved 2026-10-21):
  - No "5 open, 2 overdue." description sentence. The toolbar summary list (Open · Overdue · Completed, with mono counts and a danger `StatusLabel` on Overdue) carries it, and the toolbar keeps the static `sections.*.description`.
  - Done rows show `Check` + "Completed by {assignee}" instead of the "For {assignee}" text, so the assignee stays visible as the completer. Priority and due date are hidden on done rows.
  - `TaskGroup.tone` narrows to `"neutral" | "danger"`. Its only callers are in `TasksPageBody`.
- Done when the unit tests pass and the cs screenshots show the overdue, due-today, future and done states.

### 8. Supplies (`/shopping`)

- Zone: 🟡 `features/shopping`
- Blocked by: 4, 5
- Status: done (cs screenshots pending; cs pages are reachable since the 2026-10-26 `proxy.ts` login-redirect fix)
- Implement plan §7.4. Keep "Add item" unmounting while the composer is open.
- Deviations from plan §7.4 (approved 2026-10-26):
  - No "7 to buy." description sentence, matching To-dos: the page keeps the static `pageDescription`, and the toolbar shows the active section title with a mono count, with no eyebrow.
  - Bought rows show `Check` + "Brought by {name}" (falling back to "Brought" when the buyer is unknown) and hide "Added by" and the added date, since the only stored date is when the item was added.
  - The bought group is no longer tinted or given a `success` tone; `ShoppingGroup.tone` is removed.
  - Below `sm`, the title and the mono added date share one wrapping line, and the Return/Delete actions wrap onto their own line aligned with the title.
- Done when `e2e/shopping-create-and-undo.spec.ts` passes.

### 9. Notes (`/notes`)

- Zone: 🟡 `features/notes`
- Blocked by: 4, 5
- Status: done (cs screenshots pending; cs pages are reachable since the 2026-10-26 `proxy.ts` login-redirect fix)
- Follow-up (2026-10-26): Notes is wired into the E2E mock layer (`getE2EMockNotes()`, read-only; add/delete are not mocked). Mock photos are inline SVG data URIs, because `proxy.ts` also matches `public/` files and `next/image` fetches them without the session. The en browser check (360/768/1280, lightbox arrows, Esc, focus return) found that focus fell to `<body>` when the focused prev/next button unmounted at either end; focus now moves to "Close photo". Thumbnails and the unavailable placeholder shrink to `size-24` below `sm` (`sm:size-32` above), so a row of photos fits the 360px viewport.
- Implement plan §7.5. Before changing the gallery or upload, add characterization tests for the photo flow if they're missing.
- Deviations from plan §7.5 (approved 2026-10-26):
  - "Add note" sits in the `SectionHeader` actions slot inside `NotesPageBody` (the "Latest notes" h2 with a mono count), not in `PageHeader.actions`, because `page.tsx` is a Server Component and the composer state lives in the client body. `notes.sections.eyebrow` and `notes.sections.notesDescription` are removed.
  - Note rows show the author name `aria-hidden`, with an `sr-only` "Added by {name}", matching Supplies rows.
  - The lightbox returns focus to the opening thumbnail explicitly from the dialog's `close` event, so it doesn't rely on the browser's native focus restore.
- Done when:
  - the notes tests pass
  - the lightbox works by keyboard: arrows, Esc, and focus returns to the trigger

### 10a. Calendar: toolbar, agenda, panels, cards

- Zone: 🟢 `features/visits`
- Blocked by: 4, 5
- Status: done (2026-10-26; `visits-*.spec.ts` E2E passed during 10b; cs/en screenshots pending)
- Implement plan §7.2: the toolbar, agenda and selected-day/mobile panels, `visit/*`, and the single `{tone, icon}` status map.
- Decisions (2026-10-26):
  - Status map `getVisitStatusTone()`: current → `success` + `LogIn`, upcoming → `neutral` + `CalendarClock`, past → `neutral` + `History`. Upcoming is no longer `warning`.
  - The toolbar summary is one mono sentence ("1 here now · 3 upcoming"), without the past count. `visits.stats.*` is replaced by `visits.calendar.summaryHereNow` / `summaryUpcoming`.
  - `week/VisitsWeekMobilePanel.tsx` is restyled here (the "mobile panels"). The selected-day and mobile panels list `VisitRow`s in a `RowList` instead of `VisitCard`s.
  - The compact `VisitCard` now names its status with a `StatusLabel`, and its date strip is neutral (`COMPACT_STRIP_TONE_CLASS` removed).
  - Compact card follow-up (2026-10-26): keep the date strip on one line, show the status icon beside the visitor name with screen-reader text and a hover label, and use quiet 12px regular-weight attribution (the smallest typography token).
  - Visit card delete actions appear on card hover or keyboard focus on desktop with a fine pointer; they stay visible on touch devices and smaller screens.
  - Date-format follow-up explicitly requested (2026-10-26): compact Czech ranges within one month use `25. - 28. 10`, sharing the month once; cross-month/year and English formats stay as before. This also applies to dashboard presence cards using the same formatter.
  - Mobile visit rows also use the compact range below `lg`, on one line; desktop rows retain the full date label.
  - `shared/visit-status-tone.ts` stays until 10b/10c move the month and week cells off it (ask before deleting).
  - Not touched: `NewVisitForm`'s selected-dates chip still uses raw stone classes.
- Styling only. Read `.claude/rules/visits-calendar-exceptions.md` first.
- Done when the `visits-*.spec.ts` E2E tests pass.

### 10b. Calendar: month view

- Zone: 🟢 `features/visits`
- Blocked by: 10a
- Status: done (2026-10-26). The `VisitsMonthView`/`VisitsMonthDayCell` unit tests and the `visits-*.spec.ts` E2E pass, and arrow-key navigation was checked by hand in the browser. The cs/en screenshots are still pending.
- Files: `month/*`, `VisitsCalendarSkeleton`.
- Done ahead (2026-10-26): from `lg` up the whole month fits the viewport without scrolling. The grid fills `100dvh - 15.75rem` (was 17.75rem until the shell's desktop top padding dropped from 2rem to 1.5rem, the gap below the page header from 2.5rem to 1.25rem and the gap below the h1 from 0.75rem to 0.5rem), the weeks share the height with a 5.5rem cell floor, the toolbar sits on one row and the page description is hidden. Phones and the week view still scroll. Keep this when restyling.
- Timeline bars become neutral; status is not encoded by colour in the grid.
- **The button count per cell must not change**, because the tests use indexes.
- Done when the `VisitsMonthView` and `VisitsMonthDayCell` tests pass and arrow-key navigation works.

### 10c. Calendar: week view

- Zone: 🟢 `features/visits`
- Blocked by: 10a
- Status: done (2026-10-26). The `VisitsWeekView` and `VisitsWeekDayContent` unit tests pass. The `visits-*.spec.ts` E2E and the cs/en screenshots are still pending (outside the sandbox).
- Files: `week/*`. Keep the `data-testid`s, `data-visit-card` and the hover add button's `tabIndex={-1}`.
- Decisions (2026-10-26), mirroring 10b:
  - Timeline bars are neutral `bg-muted` at `text-xs`. Nothing imports `shared/visit-status-tone.ts` any more; deleting it is left for task 12 (ask first).
  - Desktop: mono numerals; today is the accent-filled numeral plus `aria-current`; the selected and draft-boundary columns get a 2px inset accent ring; interior draft-range headers get `bg-muted` plus the inset accent band and "In selected range" in the accessible name.
  - Mobile strip: 7 equal grid cells (no scroll), weekday + mono numeral + an `aria-hidden` visits dot (the count stays in the accessible name; the "N visits" text is dropped to fit 47px cells), and an accent top bar on the selected day.
  - The selected day's "Add visit" is `Button variant="secondary"` with a `Plus` icon; the draft-mode hint is neutral with an `Info` icon.
- Done when the `VisitsWeekView` and `VisitsWeekDayContent` tests pass.

### 11. Auth, error, not-found, landing pass

- Zone: 🟢 `app/**` UI
- Blocked by: 3, 5
- Status: done (2026-10-26). The Login, Signup, Hero, Closing, Header, PublicShell, new `WordmarkLink` and `AuthSheet` unit tests pass, the grep gate is clean on the touched files, `login.spec` and `visits-*.spec.ts` E2E pass, and the cs/en screenshots and the 1440×900 month-calendar check were reviewed.
- Decisions (2026-10-26):
  - New `app/[locale]/components/WordmarkLink.tsx` ("chata." with an `aria-hidden` accent dot, named by `appShell.title`) is shared by `AppShell`, `PublicShell` and the landing `Header`; the "CC" tile and the public header subtitle are gone.
  - New `auth/AuthSheet.tsx` holds the Login/Signup sheet (sentence-case label, display h1, description, form). The forms no longer wrap themselves in `FormSurface`; it is now unused and is left for task 12 (ask before deleting).
  - Landing: headings move from Space Grotesk to Schibsted Grotesk (`font-display` is no longer used in the app), eyebrows are sentence case, and `app/[locale]/fonts.ts` is deleted. The `--font-display` alias and its `globals.test.ts` assertion go in task 12.
  - Error and not-found pages needed no change: `PageFeedback` was restyled in task 3 and their actions already use `buttonVariants`.
  - Shell and page-header spacing (affects every authenticated page): `AppShell` desktop top padding drops from `lg:pt-8` to `lg:pt-6`; `PageHeader` gets `mb-4 lg:mb-5` (the gap below the header shrinks from 2.5rem to 1.25rem at `lg`) and its title block goes from `space-y-3` to `space-y-2`. `PageLayout` gains `headerClassName`. The month calendar offset follows: `100dvh - 15.75rem` (see 10b). Every page must be checked in the screenshots.
  - Home (`/overview`) hides the whole page header at `lg` (`headerClassName="lg:sr-only"`, the h1 stays for screen readers); below `lg` the h1 and description stay visible, as in task 6.
- Implement plan §7.6:
  - `PublicShell`
    drops the gradient and uses the wordmark
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

| Behaviour                                                                    | Layer                                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Primitive semantics (roles, names, `aria-*`, required icon/label props)      | Component tests (Vitest + RTL) in `shared/ui/*.test.tsx`                                |
| Primitive visual and a11y rules                                              | Storybook stories plus `addon-a11y` set to `error` (storybook project, Chromium)        |
| Status mapping (task due state, visit status → `{tone, icon}`)               | Unit tests next to the mapping functions, plus `TaskDueDate.test.tsx`                   |
| Shell navigation (`aria-current`, language switch, account menu, sign out)   | Component tests: `AppNav.test.tsx`, `LanguageSwitcher.test.tsx`, new `AccountMenu` test |
| Dashboard sections (empty, current and next-visit, links, overdue sub-state) | Component tests from task 0, extended in task 6                                         |
| Feature lists, forms and calendar keyboard navigation                        | Existing component tests, kept green and **not weakened**                               |
| Create, undo and login flows                                                 | Existing E2E (`e2e/*.spec.ts`)                                                          |
| No raw palette or legacy tokens                                              | `tests/design-tokens.test.ts` (unit)                                                    |
| i18n parity                                                                  | Existing `i18n/locales.test.ts`                                                         |

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
