# Fjäll migration plan

Status: **approved 2026-10-20.** D1 (walnut), D2, D3, D4, D5, D7 and D8 were accepted as recommended. D6 = **(b) only**: make Storybook `addon-a11y` blocking for `shared/ui` stories, and add no `@axe-core/playwright` dependency.
Target: [`fjall-design-spec.md`](./fjall-design-spec.md).
Inventory date: 2026-10-19 (`main` @ `cc8117c`).

---

## 0. Decisions needed before step 1

| # | Question | Recommendation |
|---|---|---|
| D1 | **Accent colour.** The request brief says "fjord-blue accent", but the spec defines `--color-accent: #6B3F24` (walnut brown). | Use the spec's walnut (contrast 8.2:1, verified). If blue is wanted, give a hex and I'll re-verify contrast before step 1. |
| D2 | **Avatar.** Today the avatar *is* the sign-out button: clicking it signs you out straight away. The spec only shows a 36/44px avatar. | Turn the avatar into a small account menu (name + "Sign out") using `@headlessui/react` `Menu`. It is already a dependency, so no new library. Alternative: keep one-click sign-out with an `aria-label`. |
| D3 | **Public landing page** (`app/[locale]/page.tsx`, `components/home/*`). It is editorial, uses Space Grotesk and GSAP, and is already mostly on tokens. | Give it a token and font pass only (it inherits the new tokens automatically). Swap pill CTAs to the 4px radius. No relayout. |
| D4 | **Type-scale override.** The spec redefines `text-xs` 12→13, `text-sm` 14→15, `text-lg` 18→17, `text-2xl` 24→28 and `text-3xl` 30→36. That changes **every** existing usage in step 1, not page by page. | Accept the global change in step 1 and review screenshots there. Most arbitrary `text-[10px]`/`[11px]` usages get replaced anyway. |
| D5 | **12px tab label.** The spec asks for 12px tab labels, but the scale has nothing below 13px. | Add one token, `--text-2xs: 12px`, used only by the mobile tab bar. |
| D6 | **axe checks.** There is no axe dependency. Options: (a) add `@axe-core/playwright` as a devDependency (touches `package.json`, so it's a red-zone change that needs approval); (b) make the existing Storybook `addon-a11y` blocking (`test: "error"`). | (b) for `shared/ui` stories, plus (a) for 5 page-level smoke checks if you approve the dependency. |
| D7 | **Data the spec shows but the app doesn't have.** The weather card's *Humidity*, *Tonight* and frost warning, and a supply *quantity*. Adding them means changing `app/api/weather` (red zone), `features/dashboard/server/weather.ts` and possibly a migration. | Out of scope. Render the fields that exist (Wind / Precipitation / Feels like). Leave the warning line slot unused until the data exists. Supply rows show a mono "added" date instead of a quantity. |
| D8 | **Test changes caused by the spec.** `AppNav.test.tsx` asserts the rail layout classes (`flex-col`, `grid`). `TaskDueDate.test.tsx` asserts overdue maps to the `warning` tone, but the spec says overdue is **danger**. | Rewrite those assertions to the new behaviour, testing semantics rather than layout classes. This replaces assertions, it doesn't weaken them, but I'll show each diff for approval. |

---

## 1. Current state (inventory summary)

### Stack
- Next.js 16 App Router, React 19, `next-intl` 4 (`cs` default at `/`, `en` at `/en/`). `<html lang>` is already set from the locale in `app/layout.tsx`.
- Tailwind v4 via `@tailwindcss/postcss`. All tokens are in `app/globals.css`, in a single `@theme inline` block.
- Icons are `lucide-react`. Motion uses `framer-motion`, `gsap` and `split-type`, on the landing page only. `@headlessui/react` is installed.
- Fonts:
  - `app/layout.tsx` loads Geist and Geist Mono. **They only load the `latin` subset**, so Czech letters such as `ě š č ř ž ů ť ď ň` fall back to a system font today. The new fonts must load `latin-ext`.
  - `app/[locale]/fonts.ts` loads Space Grotesk (`latin-ext`). Only the landing page uses it.
- Storybook 10 with `addon-a11y` (`test: "todo"`). It has stories for 8 `shared/ui` components and none for feature components.

### App shell (`app/[locale]/components/`)
- **Desktop:** a **left vertical rail** (`AppShell.tsx` `<aside className="w-32">`). It stacks Surface panels holding a house icon tile, `AppNav variant="rail"`, the weather chip, the language switcher and the logout/avatar. The spec wants a **72px top nav**, so this is a structural change, not just a restyle.
- **Mobile:** a sticky blurred top bar (house tile + title + user name + weather, then language and logout icon), plus a fixed bottom `AppNav variant="mobile"` with 5 columns, a dark pill on the active icon, and truncated labels.
- The palette is the zinc-based `nav-*` token set, plus raw `zinc-*`/`white/82` and 6 custom rgba shadows.

### Tokens today vs. usage
- Tokens exist (`page`, `surface`, `muted`, `ink*`, `border`, `border-strong`, `success/warning/danger-50…900`, `nav-*`), but **features mostly bypass them**:

  | Kind | Occurrences |
  |---|---|
  | Raw palette classes | **≈ 620** (`stone` 429, `white` 85, `amber` 30, `zinc` 29, `emerald` 28, `blue` 11, `sky` 4, `red` 3) |
  | Token classes | ≈ 250 |
  | Arbitrary values | `text-[11px]` ×39, `tracking-[0.16em]` ×15, `text-[10px]` ×10, `text-[9px]` ×1, 10 rgba `shadow-[…]` |
  | Radius | `rounded-full` 66, `xl` 49, `2xl` 39, `lg` 34, `3xl` 17, `4xl` 5 (all inconsistent) |
  | Shadows | `shadow-sm` 50, plus 10 arbitrary shadows |
  | Focus | `focus-visible:outline-none` ×40 replaced by a `ring-2`. The ring colour varies: `stone-900`, `ink`, `zinc-500`, `nav-muted` or `white` |
  | Eyebrows | `uppercase` labels in 25 files (the spec wants sentence case) |

- **Missing tokens** that features invented locally: an info/blue colour (Toast, dashboard shopping accent), sky (weather icon), `stone-950`, `amber-800/900`, `emerald-800/900`, `amber-500/950` (demo banner).
- **Dead code:** `shared/ui/StatCard.tsx` and `shared/ui/page/PageSection.tsx` are used only by their own stories, if at all.

### Hard-coded hotspots (most raw classes per file)
`DashboardOverview.tsx` 19 · `tasks/loading.tsx` 17 · `dashboardAccentStyles.ts` 16 · `VisitsMonthDayCell.tsx` 15 · `shopping/loading.tsx` 14 · `VisitsWeekMobilePanel.tsx` 13 · `VisitsWeekDayHeader.tsx` 13 · `DashboardWeatherCard.tsx` 13 · `VisitsWeekDayStrip.tsx` 12 · `VisitsCalendarToolbar.tsx` 12 · `DashboardPresenceCard.tsx` 11 · `NewNoteForm.tsx` 10.

### Shared components rebuilt by hand
| Shared component | Hand-built copies |
|---|---|
| `Surface` | `overview/loading.tsx:13`, `DashboardOverview.tsx:45`, `DashboardSummaryCard.tsx:31`, `VisitsCalendar.tsx:110`, `VisitsAgendaView.tsx:54`, `VisitsMonthView.tsx:110`, `VisitsWeekView.tsx:117`, `TasksPageBody.tsx:88`, `ShoppingPageBody.tsx:84`, `NotesPageBody.tsx:28` |
| The item card `rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm` | `TaskItem.tsx:69`, `ShoppingItem.tsx:49`, `NoteItem.tsx:23`, all skeletons |
| `Button` / `IconButton` | `VisitsCalendarToolbar.tsx:42,45,48`, `VisitsSelectedDayPanel.tsx:21`, `VisitsWeekMobilePanel.tsx:17`, `VisitsWeekDayContent.tsx:216,240` |
| `EmptyState` | `DashboardEmptyState.tsx`, `VisitsWeekMobilePanel.tsx:143` |
| `StatusBadge` | toolbar summary pills (`VisitsCalendarToolbar.tsx:33`, `CollectionToolbar.tsx:37`), dashboard count pills |
| `StatCard` | `DashboardSummaryCard.tsx`, which doesn't use the shared `StatCard` |
| Status tone map (3 copies) | `visit-status-tone.ts`, `VisitCard.tsx:10-14` (`COMPACT_STRIP_TONE_CLASS`), `visit-status-badge-tone.ts` |
| Toggle styles | `TaskToggleButton.tsx:19-29` ≡ `ShoppingToggleButton.tsx:19-31` |

---

## 2. Token mapping

### 2.1 How the new theme block is built

The new tokens go in a **plain `@theme`** block with literal hex values, *not* `@theme inline`. Without `inline`, the generated utilities read `var(--color-page)` and so on at runtime. Dark mode can then override the variables on `:root` without generating any new classes (see §5.1). The current `@theme inline` bakes in `var(--color-stone-50)`, so it can't be themed.

Migration aliases:
- During steps 1–11 a temporary **legacy block** maps the old names onto the new values, so that untouched files keep rendering sensibly. Example: `--color-ink: var(--color-ink-primary)`.
- The legacy block is deleted in step 12.
- A guard test then fails if a raw palette class or a legacy token reappears (§7, step 12).

### 2.2 Colour

| Current token / class | Fjäll token | Notes |
|---|---|---|
| `bg-page` (stone-50), **`bg-stone-100` on `<body>` in `app/layout.tsx`** | `page` `#F5F6F3` | The body background is hard-coded and disagrees with the shell's `bg-page`. Both should use `page`. |
| `bg-surface`, `bg-white`, `bg-white/82`, `/88`, `/95` | `surface` `#FFFFFF` | Drop the translucent and blurred variants. |
| `bg-muted`, `bg-stone-100`, `bg-stone-50`, `bg-stone-50/70`, `/80`, `bg-zinc-100`, `bg-nav-surface` | `muted` `#ECEEEA` | Only for hover and skeletons. The tinted "group panels" (`bg-stone-50/70`) are **removed** rather than recoloured, because structure now comes from whitespace. |
| `border-border`, `border-stone-200`, `divide-stone-200`, `border-zinc-200`, `border-nav-border` | `border` `#DDE1DC` | Hairlines only. At 1.3:1 it is **decorative**, so it must never be the only edge of a control (§6.1). |
| `border-border-strong`, `border-stone-300/400` | `ink-primary` (1.5px, controls) or `border` (decorative) | The `border-strong` token is retired. Inputs and secondary buttons switch to the 1.5px ink border. |
| `text-ink`, `bg-ink`, `ring-ink`, `text-stone-900/950`, `text-zinc-900/950`, `text-nav-ink`, `text-nav-emphasis` | `ink-primary` `#1B2428` | Renamed. A temporary `--color-ink` alias covers files not yet migrated. |
| `bg-ink-hover`, `hover:bg-stone-800` | `accent-hover` (primary button) | The primary button is now accent, not ink. |
| `text-ink-secondary`, `text-stone-600/700`, `text-zinc-600/700` | `ink-secondary` `#3D4A50` | `stone-700` had no token; it becomes ink-secondary. |
| `text-ink-muted`, `text-stone-500`, `text-zinc-500`, `text-nav-muted` | `ink-muted` `#5A676D` | The new value is darker than stone-500 (5.4:1 vs about 4.6:1). |
| `text-ink-faint`, `text-stone-400`, `text-nav-faint`, `placeholder:text-ink-faint` | **text → `ink-muted`**; decorative icons and rules → `ink-faint` | There are 4 text usages plus the placeholder today, and they fail AA. The new rule is that faint is never used for text. |
| `success-50/200/700`, `emerald-*` (incl. `-800/-900`) | `success` `#2F6B4A` | There are no tints any more. Status becomes **icon + coloured text on the surface**, with no filled pill. |
| `warning-50/200/700`, `amber-*` (incl. `-800/-900`) | `warning` `#8A5A00` | Same. |
| `danger-50…900`, `red-*` | `danger` `#B0322A` | Error fields lose the red fill and get a danger border plus an icon and message. |
| `blue-*` (Toast info, dashboard shopping), `sky-*` (weather icon) | `ink-secondary` | There is no info colour; "info" is conveyed by the `info` icon and text. |
| `dashboardAccentStyles.ts` (emerald, amber, blue and stone per domain) | **deleted** | Four domain colours contradict "one accent colour". Domains are told apart by label and icon. |
| `bg-amber-500 text-amber-950` (`DemoModeBanner`) | `bg-ink-primary text-on-accent` | 15.8:1. |
| `text-white` on dark fills | `on-accent` | |
| `nav-*` (entire set) | **deleted** | The shell uses the general tokens. |
| new | `accent` `#6B3F24`, `accent-hover` `#4A2E1B`, `on-accent` `#FFFFFF` | For links, primary buttons, focus, active nav and the selected day. |

### 2.3 Shape, elevation and type

| Current | Fjäll | Notes |
|---|---|---|
| `rounded-2xl/3xl/4xl/[1.75rem]` on cards | `rounded-card` (4px) | |
| `rounded-lg/xl/md` on controls | `rounded-control` (4px) | |
| `rounded-full` on badges, pills, chips and the avatar | removed, or `rounded-control` | `rounded-full` stays only for real circles: the today dot and spinners. |
| `shadow-sm`, `shadow-lg`, `shadow-[rgba…]` | `shadow-card` (none), i.e. removed | The Toast and the lightbox use an inverted surface instead of a shadow (§4.10). |
| `font-sans` Geist | `--font-sans` Schibsted Grotesk 400–800 | Loaded with `next/font/google` `Schibsted_Grotesk`, subsets `latin` and `latin-ext`, `display: swap`. |
| `font-mono` Geist Mono, `tabular-nums` | `--font-mono` Spline Sans Mono 400–600 | `Spline_Sans_Mono`. Mono is applied to every date, count, temperature and time. |
| `font-display` Space Grotesk | removed in the app | Landing page per D3. |
| `text-[9px]`, `[10px]`, `[11px]` | `text-xs` (13) | 13px is the floor for text. The only exception is `text-2xs` (12, tab labels, D5). |
| `text-[13px]`, `[15px]` | `text-xs` / `text-sm` | These now land exactly on the new scale. |
| `text-[1.7rem]`, `[2.75rem]` page titles | `text-display` | 40 on mobile, 56 on desktop, set with `--text-display` plus an `lg:` override. |
| `uppercase tracking-[0.14/0.16em]` eyebrows | section label: `text-xs font-semibold text-ink-muted` | Sentence case. The CSS change doesn't affect DOM text, so tests are unaffected. |
| `max-w-4xl` / `max-w-7xl` (`PageContent`) and `max-w-360` (shell) | `--container-page: 1180px` → `max-w-page` | Container padding: `px-5 lg:px-10`. |
| Arbitrary heights, widths and grid columns (`min-h-[4.75rem]`, `grid-cols-[minmax(0,1.45fr)…]`, `xl:grid-cols-[…_23rem]` vs `24rem` in the skeleton) | spacing scale or named layout classes | Home uses the spec's flex-wrap layout instead of the arbitrary grid. |

### 2.4 Additions beyond the spec block
These are kept to the minimum:
- `--text-2xs: 12px` (D5).
- `--text-stat-sm: 22px` and `--text-stat: 40px`: the spec's stat and temperature numbers.
- `--tracking-display` (−0.03em), `--tracking-heading` (−0.01em), `--tracking-data` (−0.04em): the spec's letter-spacing values.
- `--container-page: 1180px`.
- A `--border-width-control: 1.5px` value, exposed as an `@utility border-control`. Whether `border-[1.5px]` or the utility gets used is settled in step 1; arbitrary values aren't wanted in feature code.

Everything else is from the spec.

---

## 3. Global base layer (`app/globals.css`)

- `body`: `bg-page text-ink-primary font-sans antialiased`. The hard-coded `bg-stone-100 text-stone-900` in `app/layout.tsx` is removed.
- **One focus rule for everything**, so the 40 per-component `outline-none` + `ring` combinations can be deleted:
  ```css
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  ```
  - Grid cells and anything inside an `overflow-hidden` container use `outline-offset: -2px` through a `focus-inset` utility, because outlines get clipped otherwise.
  - Leftover `focus-visible:outline-none` utilities would beat the base rule (the utilities layer wins), so each step deletes them in the files it touches.
- `html { scroll-padding-top: 88px }`. This stops the sticky 72px header from covering a focused element or an anchor target such as `#main-content` or the composer scroll.
- `::placeholder { color: var(--color-ink-muted) }`.
- `.storybook/preview.tsx`: change the background swatch `#fafaf9` → `#F5F6F3`.

---

## 4. Component changes

Each entry lists the files touched. 🟡 means yellow zone: characterization tests come first (AGENTS.md "Zones").

### 4.1 App shell (green, plus 🟡 `shared/ui/SkipToContentLink`)
Files:
- `app/[locale]/components/AppShell.tsx`, `AppNav.tsx` (+ `AppNav.test.tsx`), `LanguageSwitcher.tsx` (+ test)
- `NavWeatherChip.tsx`, `ClientWeatherChip.tsx`, `ClientWeatherMobile.tsx`
- `auth/LogoutButton.tsx`, `DemoModeBanner.tsx`
- `shared/ui/SkipToContentLink.tsx`

**Desktop (`lg:` and up): the rail is replaced by a top nav.**
- `<header>`: `h-18` (72px), `border-b border-border bg-page`, sticky. Inside it, the `max-w-page` container is a flex row.
- **Wordmark** `chata.`: `text-xl font-extrabold`, with the full stop in a `<span class="text-accent" aria-hidden>`. It links to `/overview` with `aria-label={appShell.title}`. Not translated; it's a brand name.
- **`AppNav variant="top"`** (replaces `"rail"`):
  - a `<ul>` flex row with `gap-7` (28px)
  - links are full header height (`h-full`) with `text-sm`
  - active: `font-bold text-ink-primary` plus a 2px accent bottom border (`border-b-2 border-accent`), keeping `aria-current="page"`
  - inactive: `font-medium text-ink-secondary hover:text-ink-primary`
  - no icons on desktop
  - **no `truncate`**: labels wrap
- **Right side:**
  - weather chip: `CloudSun` in `ink-secondary` plus mono `12°C`, no pill background
  - `LanguageSwitcher`
  - avatar: 36px square, `bg-ink-primary text-on-accent rounded-control font-semibold`. Per D2 it becomes a Headless UI `Menu` button with `aria-label="{signedInAs name}"`. The menu items are the name and **Sign out**, keeping the existing `signOutAction` form.

**Mobile top bar:**
- Wordmark on the left. On the right: weather chip, language button and a 44px avatar.
- Background `bg-page`, `border-b border-border`, no blur. It keeps the `--safe-area-top` padding.

**Mobile tab bar:**
- `bg-surface border-t border-border`, 5 equal columns, each `min-h-15` (60px).
- Each tab is a 22px Lucide icon (`strokeWidth={1.75}`) above a `text-2xs` label.
- Active: `text-accent`, a 3px top bar (`before:` pseudo-element, `bg-accent`), and `aria-current="page"`. **Inactive tabs are `text-ink-secondary`**, not `nav-faint`, which failed contrast.
- Labels wrap instead of being truncated.
- Remove the dark pill around the icon.

**`LanguageSwitcher`:**
- Mono `CS · EN`, where `·` is `aria-hidden`.
- Each option is a `<button>` with a **44×44 hit area** (`min-h-11 min-w-11`). The current buttons are 28px.
- Active: `text-ink-primary underline decoration-2 underline-offset-4` with `aria-pressed="true"`. Inactive: `text-ink-secondary`.
- The group role, `aria-label`s, `lang` attributes and `router.replace` behaviour stay, so the tests keep passing.

**Other shell pieces:**
- `SkipToContentLink`: `bg-ink-primary text-on-accent rounded-control`, no shadow.
- `DemoModeBanner`: `bg-ink-primary text-on-accent text-xs`.
- `AppNav.test.tsx`: rewrite the class assertions (`flex-col`, `grid` + inline `gridTemplateColumns`) into semantic ones:
  - the nav landmark has the right name
  - exactly one `aria-current="page"`
  - the full label is still exposed when `shortLabel` differs
  - labels aren't truncated (no `truncate` class)

See D8.

### 4.2 Card / sheet (🟡 `shared/ui/Surface.tsx`, `FormSurface.tsx`)
- `Surface`: `rounded-2xl border border-border bg-surface shadow-sm` → `rounded-card bg-surface`. No border, no shadow.
  - Add a `padding` prop: `"none" | "default"`, where default is `p-4 lg:p-6` (16 → 24).
  - Add `as?: "div" | "section" | "article"`.
- **Risk:** a few places nest a Surface on a white background (shell panels, visits panels). Those nestings get removed, not restyled, since a white sheet on white would disappear.
- New **`shared/ui/RowList.tsx`**: `<ul class="divide-y divide-border">` plus a `RowListItem` that enforces `min-h-12` (48px), `py-3`, and handles two-line titles. It's used by dashboard, tasks, shopping, notes and visits, so it qualifies for `shared/ui/`. Co-locate a `.stories.tsx`.

### 4.3 Stats (dashboard only, so it lives in `features/dashboard/components/`)
- Replace `DashboardSummaryCard.tsx` and `dashboardAccentStyles.ts` with **`DashboardStats.tsx`**:
  - The spec's stat numbers (22px mobile, 40px desktop) aren't on its type scale, so the plan adds two named data sizes: `--text-stat-sm: 22px` and `--text-stat: 40px` (listed in §2.4).
  - **Mobile:** a `<dl>` list with `border-t border-ink-primary`. Each row is `min-h-14`, with the label on the left and a mono `text-stat-sm` number on the right, and a hairline below.
  - **Desktop:** a 4-column strip with `border-t border-ink-primary`. Cells are separated by `border-l border-border` (none on the first). Each cell is a mono `text-stat` number above a 14px label.
  - Each cell is a link to its page, so the whole cell is clickable with a ≥48px target.
  - Extra state goes under the label. For tasks it's `overdueCount` (the data exists): `TriangleAlert` + "2 overdue", in `text-danger text-xs font-semibold`.
- Delete `shared/ui/StatCard.tsx` and its story. It's unused, and deleting files needs approval.

### 4.4 Buttons and links (🟡 `shared/ui/Button.tsx`, `IconButton.tsx`, new `TextLink.tsx`)
- `Button`:
  - **primary**: `bg-accent text-on-accent hover:bg-accent-hover`
  - **secondary**: `border-control border-ink-primary bg-transparent text-ink-primary hover:bg-muted`
  - both: `rounded-control min-h-11 px-4 text-sm font-semibold`
  - new prop `block` → `w-full min-h-12 justify-between`, for full-width buttons with a trailing `ArrowRight`
  - remove the ring classes, since the global focus rule covers it
  - `buttonVariants()` keeps its signature (used by error, not-found and the shells)
- `IconButton`:
  - every size has a **44×44 minimum** (`size-11`). `compact` stays visually small with an 18px icon, but the hit area is still 44.
  - style: transparent background, `text-ink-secondary hover:bg-muted hover:text-ink-primary`, `rounded-control`
  - the TypeScript props require `aria-label` (`"aria-label": string`), so icon-only buttons can't ship without a name
- New `TextLink` (Next `Link` from `@/i18n/navigation`): `text-accent font-semibold hover:text-accent-hover inline-flex items-center gap-1.5 min-h-11` with a trailing 16px `ArrowRight` (`aria-hidden`).
- Remove the hand-built copies in visits (§1) and use `Button` / `IconButton` instead.

### 4.5 Status (🟡 `shared/ui/StatusBadge.tsx` → `StatusLabel`)
- Redesign as an inline **icon + text** label with no pill, border or fill. The colour sits on the text and icon.
- The type makes the icon mandatory whenever colour carries meaning:
  ```ts
  type StatusLabelProps =
    | { tone: "danger" | "warning" | "success"; icon: LucideIcon; children: ReactNode }
    | { tone: "neutral"; icon?: LucideIcon; children: ReactNode };
  ```
  - Adds a `danger` tone, with a `never` exhaustiveness check in the tone map.
- Keep the `StatusBadge` export as a thin alias for one step, so `TaskDueDate.test.tsx` (which mocks the module path) keeps working until it's updated.
- Status mapping for the whole app:

  | State | Tone | Icon | Example (en / cs) |
  |---|---|---|---|
  | Task overdue | danger | `TriangleAlert` | "Overdue since 12 Oct" / "Po termínu od 12. 10." |
  | Task due today | warning | `Clock` | "Due today" / "Dnes" |
  | Task future | neutral, mono date | `Calendar` | "Due Fri 23 Oct" / "pá 23. 10." |
  | Task / supply done | neutral (`ink-muted`) | `Check` | "Done by Jana" |
  | Visit current | success | `LogIn` | "Occupied" / "Obsazeno" |
  | Visit upcoming | neutral | `CalendarClock` | "Upcoming" |
  | Visit past | neutral (`ink-muted`) | `History` | "Past" |
  | Priority | neutral (`ink-secondary`) | none | "High priority", words only |
  | Weather alert | warning | `TriangleAlert` | slot only (D7) |

- `visit-status-tone.ts` and `VisitCard`'s `COMPACT_STRIP_TONE_CLASS` are deleted. `visit-status-badge-tone.ts` becomes the single map from status to `{tone, icon}`.

### 4.6 Section headers, page headers, lists (🟡 `shared/ui/SectionHeader.tsx`, `shared/ui/page/*`, `FilterNav.tsx`, `CollectionToolbar.tsx`)
- `PageHeader`:
  - h1: `text-display font-bold tracking-[-0.03em] leading-none` at 40px on mobile and 56px on desktop
  - description: `text-base lg:text-lg text-ink-secondary max-w-160`
  - tracking: the spec's −0.03em / −0.01em / −0.04em become `--tracking-display`, `--tracking-heading` and `--tracking-data` tokens, not arbitrary values
- `PageContent`: `max-w-page`, with section gaps `space-y-7 lg:space-y-10` (28 / 40).
- `SectionHeader`:
  - eyebrow → sentence-case `text-xs font-semibold text-ink-muted`
  - title → `text-xl font-bold tracking-heading`
  - `actions` slot → usually a `TextLink`
- `FilterNav`: the segmented pill box becomes **underline tabs**, the same pattern as the desktop nav.
  - Each link is `min-h-11`; active has a 2px accent bottom border plus `font-semibold`, with `aria-current="page"` kept.
  - The count is mono, `aria-hidden`, and stays in the existing `aria-label="Label (n)"`.
  - It sits on a `border-b border-border` baseline.
- `CollectionToolbar`:
  - drop the card, the eyebrow and the count pill
  - the count and summary become **one sentence** with mono numbers, e.g. "7 to buy · 2 overdue", with the overdue part carrying a `StatusLabel`
  - the primary action is `min-h-11`, and **its label stays visible at every width**, because a 40px icon-only button failed the size target. That also keeps the "Add item" E2E selector stable.
- `PageSection`: delete (unused; needs approval).

### 4.7 Lists and rows
- Task, Supply and Note items stop being individual cards. They become `RowListItem`s inside **one sheet per group**.
- The tinted group panels (`TaskGroup.tsx:21`, `ShoppingGroup.tsx:24`, `NotesPageBody.tsx:69`) are removed. A group is a `SectionHeader` plus a sheet.
- Hover-only delete actions:
  - Desktop keeps hover-reveal, with the existing `group-focus-within` covering keyboard users.
  - **On touch (`@media (hover: none)`) they are always visible.** Today they're visible on mobile only by accident of the `sm:` prefix.

### 4.8 Forms (🟡 `shared/ui/Form/*`, `FieldLabel.tsx`, `FormMessage.tsx`; feature forms are green except shopping and notes)
- `formStyles.ts`:
  - `rounded-control border-control border-ink-primary bg-surface min-h-11 px-3.5 text-base text-ink-primary`
  - placeholder is `ink-muted`
  - disabled: `bg-muted text-ink-muted border-border`
  - error: `border-danger` (still 1.5px) on the surface, with no red fill
  - focus: the global accent outline with `outline-offset: 0` (deviation from the spec's 2–3px, approved 2026-10-21). With a gap, the outline drew a second frame around the 1.5px border; at offset 0 it reads as one thicker frame. Text fields only; every other control keeps the 2px offset.
- `FieldLabel`: `text-sm font-semibold text-ink-primary`. The required `*` becomes `text-danger` and stays `aria-hidden`, because `required` is already on the input.
- `FieldError`: `TriangleAlert` (14px) + text in `text-danger text-xs font-semibold`, keeping `role="alert"`.
- `FieldHint` and the character counters: `text-xs text-ink-muted`. Counters go mono.
- `FormComposer`:
  - an inline sheet (`Surface`) with a `SectionHeader` title (`text-xl`)
  - the close button becomes `Button variant="secondary"` at 44px, with the X icon and "Close" text. It's about 28px today.
  - accessible names are unchanged, since tests use the visible text
- `FormSubmitBar`: hairline top border, hint in `text-xs text-ink-muted`.
- `FormMessage`: no tinted box. It's a row with an icon (`CircleCheck` / `TriangleAlert`) plus text in success or danger colour, with a 3px left rule in the same colour. Roles and `aria-live` are unchanged.
- Checkbox toggle: new **`shared/ui/CheckToggle.tsx`**, which replaces the duplicate `TaskToggleButton` and `ShoppingToggleButton` styling (§5.2).
- Photo upload in `NewNoteForm`: details in §5.2.

### 4.9 Empty, loading and error states
Details in §5.3. Files:
- 🟡 `shared/ui/EmptyState.tsx`
- `features/dashboard/components/DashboardEmptyState.tsx` (deleted and merged into `EmptyState`)
- the five `app/[locale]/(dashboard)/*/loading.tsx` files and all `*Skeleton.tsx`
- `shared/ui/page/PageFeedback.tsx`, `app/[locale]/error.tsx`, `(dashboard)/error.tsx`, `not-found.tsx`
- new 🟡 `shared/ui/Skeleton.tsx`

### 4.10 Toast (🟡 `shared/Toast/Toast.tsx`, `ToastContainer.tsx`)
- A floating element with no shadow and no border would vanish over white sheets. So it uses an **inverted surface**: `bg-ink-primary text-on-accent rounded-card` (15.8:1).
- The type is shown by **icon + text**, with the icons in `on-accent`: `TriangleAlert` / `Info` / `CircleCheck`. Status colours fail contrast on the dark ink, so they aren't used here.
- The action ("Undo") becomes an underlined text button at `min-h-11`. Dismiss becomes `IconButton` at 44px; the current hit area is only 16px.
- `role="status"` / `role="alert"` and `aria-live` are **unchanged**, because the E2E tests filter `getByRole("status")`.
- Fix the bug where the border colour classes have no border width.

---

## 5. Gaps the spec doesn't cover yet

### 5.1 Dark mode
- **How it's built:** with the non-inline `@theme` (§2.1), the variables are overridden in `@media (prefers-color-scheme: dark) { :root { … } }` and `color-scheme: light dark` is set.
  - No toggle in v1. A toggle later would mean a `data-theme` attribute plus a cookie, which is out of scope.
  - No `dark:` variants in components, because tokens do all the work.
- Proposed values, extending the spec's suggestion. **I computed the contrast ratios myself:**

  | Token | Dark | vs page / surface |
  |---|---|---|
  | page | `#12181B` | — |
  | surface | `#1A2226` | — |
  | muted | `#232D32` | — |
  | border | `#2E3A40` | 1.5 / 1.4 (decorative) |
  | ink-primary | `#E8EDEE` | 15.2 / 13.7 |
  | ink-secondary | `#C2CBCE` | 10.9 / 9.8 |
  | ink-muted | `#94A1A6` | 6.8 / 6.1 |
  | ink-faint | `#55636A` | 2.9 / 2.6 (decorative) |
  | accent | `#D4A27A` | 7.9 / 7.1 |
  | accent-hover | `#E2BB9A` | 10.1 / 9.1 |
  | on-accent | `#12181B` | 7.9 on accent |
  | success | `#6FC79A` | 8.8 / 7.9 |
  | warning | `#E3B451` | 9.3 / 8.4 |
  | danger | `#F2877D` | 7.3 / 6.6 |

- **Rule:** the dark surface is lighter than the page, which matches the light theme's surface-over-page relationship, so sheets stay visible without borders.
- The Toast's inverted surface flips automatically.
- Delivered last (step 13), so it doesn't hold up the main migration.

### 5.2 Form controls
| Control | Proposal |
|---|---|
| Text input, textarea, date | §4.8. Native `type="date"` is kept (the E2E fills "From" and "To" as ISO strings); its value text is mono. Textareas keep `resize-y`. |
| Select (none today; shown for completeness) | Native `<select>` with `appearance-none`, the input styles, and a trailing `ChevronDown` (`aria-hidden`, `pointer-events-none`). |
| Checkbox / task & supply toggle (`CheckToggle`) | A `<button aria-pressed>`, keeping today's semantics and test names ("Toggle item"). Visual is a 22px square with a 1.5px `ink-primary` border, radius 4. Checked: `bg-accent` with a white `Check` (stroke 2.5). Pending: `Loader2` spin, `motion-safe` only. **Hit area 44×44** via padding (today 40). Read-only: the visual box stays, and the state is announced with `sr-only` text instead of `aria-hidden`. Today read-only state is visual only. |
| Radio / segmented (calendar view switcher) | Underline tabs as in `FilterNav`, but as `<button aria-pressed>` (the E2E clicks button "Week"). |
| File upload (notes) | The `<label for>` styled as a secondary `Button` with the `ImagePlus` icon, keeping the `sr-only` input. `focus-within` draws the accent outline on the label. The dashed drop zone is dropped and replaced by a hint line. Previews: 4px radius, `bg-muted`, remove button `IconButton` at 44 on an `ink-primary/80` scrim. Today's remove button is 32px. |
| Character counter | Mono `text-xs text-ink-muted`, right-aligned in the field footer. |

### 5.3 Empty, loading and error states
| State | Proposal |
|---|---|
| **Empty** (`EmptyState`) | Lives **inside** the sheet, with no dashed box. The title stays a heading (tests query `getByRole("heading")`), styled `text-base font-semibold`. Below it, one plain sentence in `ink-secondary`, following the copy tone ("Nobody right now.", "Nothing to buy."), and an optional `TextLink` action. `DashboardEmptyState` is merged into it. The existing `sr-only role="status"` announcer in the lists stays. |
| **Loading** (route `loading.tsx` + `*Skeleton`) | New `Skeleton` primitive: `bg-muted rounded-control motion-safe:animate-pulse`. Each skeleton must **mirror the final Fjäll layout exactly**. Today they've drifted: `p-4` vs `p-3.5`, `24rem` vs `23rem`. The wrapper gets `aria-busy="true"` plus `<span role="status" class="sr-only">{common.loading}</span>`, using the existing key (no announcer exists today). |
| **Error, page** (`PageFeedback` tone=error) | A sheet with a `TriangleAlert` (danger) next to the h1, a description in `ink-secondary`, and primary and secondary actions. The red fill and border go away. `role="alert"` stays. |
| **Error, dashboard card** | The streamed sections already fall back through the route `error.tsx`. Per card, an unavailable weather card becomes a row with `CloudOff` + "Weather isn't available right now." in `ink-secondary` (reusing the existing `unavailableTitle` / `Description` keys). No new error boundaries; the streaming shape is preserved per `.claude/rules/dashboard-streaming.md`. |

---

## 6. Accessibility risks

### 6.1 Contrast
I verified this myself with WCAG relative luminance. Every spec claim holds:
- ink-primary 14.6 / 15.8
- ink-secondary 8.4 / 9.2
- ink-muted 5.4 / 5.8 (5.0 on `muted`)
- accent 8.2 / 8.9
- success 5.8, warning 5.5, danger 5.8
- white on accent 8.9

Risks:
- `ink-faint` (2.1:1) and `border` (1.3:1) **fail even the 3:1 UI-component threshold**. Neither may be the only edge of an input, toggle, selected cell or today ring. That's why controls switch to the 1.5px `ink-primary` border (15.8:1). Today's inputs use `border-strong` (stone-300 on white, about 1.5:1), which **already fails WCAG 1.4.11**, so this migration fixes it.
- Text opacity modifiers (`text-white/70`, `/80` in the week strip) are banned on the new tokens, because the ratio can't be guaranteed.
- `warning` text on the `muted` hover fill is 5.08, which passes but is the tightest pair. Hover backgrounds therefore stay `muted`, never a darker shade.
- Selected day in the month view: accent fill with `on-accent` numerals (8.9). Today: a 2px `ink-primary` ring plus `aria-current="date"`. These must stay distinguishable from focus (§6.2).

### 6.2 Focus
- One accent outline everywhere (§3). That means removing 40 `outline-none` and ring combinations; each step has a grep check for this.
- **Clipping:** `overflow-hidden` sheets (calendar, toolbar cards) clip outlines. Use `focus-inset` there, or drop `overflow-hidden`.
- **Focus vs. selected in the calendar:** both currently use dark rings. In the new design, selected is a filled day number and focus is an outline, so they never look alike.
- The sticky header must not hide the focused element (`scroll-padding-top`, §3). Strictly that's WCAG 2.2's 2.4.11, but it's cheap.
- `VisitsWeekDayContent`'s hover "add" button is `tabIndex={-1}`, and a test pins that. It's acceptable, because the keyboard path (select the day, then the visible "Add visit" button) exists. The plan keeps it and documents it.

### 6.3 Touch targets (44px floor, per the spec)
These fail today and are fixed by the shared primitives:
- **40px:** `IconButton` default (every delete), Task and Supply toggles, the shopping "Return to list" action, the `CollectionToolbar` mobile action, `FilterNav` links
- **36px:** visits toolbar buttons (`h-9`), the photo "Add photos" label
- **32px:** `IconButton compact` (compact `VisitCard` delete), photo remove, dashboard preview CTA (`min-h-8`)
- **28px:** `FormComposer` close, `LanguageSwitcher` options
- **16px:** Toast dismiss
- **Text-only links:** landing header nav, the Closing GitHub link

Month day cells are about 48px wide at 375px, which is acceptable; keep the minimum heights.

### 6.4 Colour-only status
These rely on colour alone today and are fixed as follows:
- **Month and week timeline bars** (emerald, amber, stone by status; `aria-hidden`): the bars become one neutral style (`bg-muted text-ink-primary`, name only). Status is no longer encoded in the grid at all, because it can't carry icon and text at 18px. The selected-day panel shows `StatusLabel`s, and the cell's `aria-label` keeps the count.
- **Compact `VisitCard` date strip:** gets a `StatusLabel` (icon) next to the mono dates.
- **Dashboard domain accent bars and icon tiles:** deleted (§2.2).
- **`TaskDueDate`:** overdue and due-today look identical today (both warning). They split into danger + `TriangleAlert` and warning + `Clock`.
- **Read-only toggle:** state is exposed via `sr-only` text (§5.2).
- **Active nav and tabs:** shown by weight + bar/underline + `aria-current`, not hue alone.

### 6.5 Czech text (20–30% longer) and localisation
- **Remove `truncate`** from nav labels (`AppNav.tsx`), preview titles (`DashboardPreviewCards.tsx:129`), task and visit meta, and `VisitDetails` compact titles. Use wrapping or `line-clamp-2` instead.
- `RowListItem` is designed for two-line titles.
- Statement copy at 30/36px will wrap in Czech. For example, `presence.currentTitle` "Na chatě teď někdo je", or "Petr a Jana jsou na chatě." needs no truncation; check it at 360px.
- **Dates:** the spec writes Czech dates as "pá 23. 10." The existing formatters (`format*Date.ts`, all unit-tested) should be checked against that format. If they differ, that's a separate change with test updates, flagged rather than folded in.
- **Copy changes.** The spec's sentence tone changes some strings, for example the presence statement "{names} are there." / "{names} jsou na chatě.", the stat sub-state "{count} overdue", and the visit status words. Every new key goes into `cs.json` and `en.json` in the same commit, with ICU plurals for Czech (`one/few/other`), and `i18n/locales.test.ts` checks parity.
- Hard-coded strings found on the way:
  - `"mm"`, `"km/h"`, `"°C"` in `DashboardWeatherCard`
  - `" · "` and `"..."` in `DashboardPreviewCards`
  - `"…"` in `LogoutButton`
  - `"CC"` logo text

  The units and separators move to i18n or `Intl.NumberFormat` with `unit`.
- **Verification:** every page is screenshotted in **cs** at 360px and 1280px, because cs is the longer and default locale.

---

## 7. Page proposals

Principles for every page:
- The title is the display h1 with the description below it.
- Section labels are in sentence case.
- Every group is one white sheet with hairline rows.
- Mono for every number and date.
- Status always as `StatusLabel`.
- One primary (accent) action per view; everything else is secondary or a text link.

### 7.1 Home (`/overview`), following the spec exactly
Files: `features/dashboard/components/*`, `app/[locale]/(dashboard)/overview/{page,loading}.tsx`.

**Desktop:** a `flex flex-wrap gap-10` container.
- **Left column** (`basis-85 grow shrink`, about 340px), top to bottom:
  - **Presence:**
    - label "At the cottage now"
    - **statement** "Petr & Jana are there." in `text-2xl lg:text-3xl font-bold tracking-[-0.02em]` (or "Nobody right now.")
    - `StatusLabel success LogIn` "Occupied" when someone is there
  - **Next arrival:** a hairline row with the name and a mono date range.
  - **Primary CTA:** `Button block` "Plan a visit", with a trailing `ArrowRight`, linking to `/visits`.
  - **Weather sheet:**
    - mono `text-stat` "12°" with the condition text right-aligned
    - a hairline, then a 3-column grid of label over mono value: **Wind / Precipitation / Feels like** (D7)
    - the warning slot is unused for now
- **Right column** (`basis-140 grow-2`, about 560px):
  - **Stats strip** (4 cells): Upcoming visits · Open to-dos (+ "⚠ n overdue") · Supplies to buy · Recent notes
  - **Latest notes:** heading with "All notes →", then note rows: author 700 in a 150px column, mono timestamp, text in `ink-secondary`
  - then a `grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` holding **To-dos** and **Supplies** previews
    - this is the spec's own arbitrary value; it gets one named `@utility grid-previews`
    - to-do rows link to the task, with the title at 16/600 and a meta line of `StatusLabel` due + "High priority"
    - supply rows show the item with a mono date on the right

**Mobile:** DOM order already gives the spec order: title → presence → (CTA) → weather → stats list → notes → to-dos → supplies.

**Streaming constraint:**
- The left column holds the presence `Suspense` and `ClientWeatherCard`. The right column holds the stats/preview `Suspense`.
- The current two Suspense boundaries map one-to-one onto the two columns, so **no change to `startDashboardStreaming()` or the data shape** is needed.
- Reordering notes before tasks and shopping is presentational only.

**Code removed:**
- `dashboardAccentStyles.ts`, `DashboardSummaryCard.tsx`, `DashboardEmptyState.tsx`
- the `lg:grid-cols-[minmax(0,1.45fr)…]` layout
- the hand-built skeleton Surfaces

**Before changing anything:** the dashboard has **no component tests**. Characterization tests come first, covering what each section renders for the empty, current-visit and next-visit cases and the links' hrefs.

### 7.2 Calendar (`/visits`)
Files: `features/visits/components/**` (styling only). The calendar's history and optimistic-merge behaviour stays exactly as it is (`.claude/rules/visits-calendar-exceptions.md`).

**Header:** display title "Calendar". The toolbar sits on the page background, not in a card:
- the period label ("October 2026") as `text-xl font-bold`, kept `aria-live`
- prev / today / next as secondary buttons at 44px (today they're 36px)
- the view switcher as underline tabs with `aria-pressed` buttons (Month · Week · Agenda)
- the summary pills become one mono sentence: "1 here now · 3 upcoming", with a `LogIn` icon on "here now"
- "New visit" as the primary button

**Month:**
- One sheet. Day cells are separated by `border-border` hairlines, with no outer border or rounded-4xl.
- Weekday headers: sentence-case `text-xs text-ink-muted`, not uppercase.
- Day numbers are mono.
- States:
  - today: 2px `ink-primary` square ring plus `aria-current`
  - selected: accent-filled numeral
  - outside the month: `text-ink-muted` on `bg-page`
  - draft range: `bg-muted`, with a 2px accent inset outline on the boundaries
- Visit bars: neutral muted fill with the name (§6.4) at `text-xs`, not 9–10px.
- Desktop selected-day panel (the `xl` right column): a sheet with a sentence-case label, the date as heading, visit rows of name 600 + mono dates + `StatusLabel`, and a primary "Add visit".

**Week:**
- Desktop: 7 hairline-separated columns, and a header row with mono day numbers.
- Mobile strip: 7 equal cells (no horizontal scroll needed at 7×48px). Each has the weekday in `text-xs` and a mono numeral. Selected uses an accent top bar plus `aria-pressed`, mirroring the tab bar.
- Mobile panel: a sheet with rows.

**Agenda:** a section heading per group (sentence case + mono date range), then a sheet of `VisitRow`s.

**Tests:** index-based tests (`buttons[2]`) must keep the button count per cell, so **no new buttons are added inside cells**. `data-testid`s and `data-visit-card` stay.

### 7.3 To-dos (`/tasks`)
Files: `features/tasks/components/**`, `tasks/{page,loading}.tsx`.

- Title "To-dos", plus a description sentence such as "5 open, 2 overdue." with mono numbers and a `StatusLabel` on the overdue part.
- Filters: underline tabs with mono counts. "Add to-do" is the primary button.
- Groups, as `SectionHeader` + sheet each:
  - **Overdue:** heading with a `TriangleAlert` in danger, so it isn't conveyed by the amber panel any more
  - **On track**
  - **Done**
- Each row:
  - `CheckToggle`
  - title 16/600, with strike-through and `ink-muted` when done
  - meta line at 13px with 14px gaps: due `StatusLabel` · "High priority" (words, `ink-secondary`) · "For Jana" (the assignee becomes plain text, not a chip) · mono created time
  - the description in `ink-secondary` below
  - delete `IconButton` on the right
- Composer: an inline sheet below the toolbar, with the selected-date pill restyled as a mono text line.

### 7.4 Supplies (`/shopping`)
Files: `features/shopping/components/**`, `shopping/{page,loading}.tsx`. Characterization tests come first (yellow zone; some already exist).

- Title "Supplies", description "7 to buy."
- Filters: To buy · Bought, as underline tabs with mono counts. Primary "Add item": same accessible name, and the toolbar button still unmounts while the composer is open (that's what the E2E relies on).
- One sheet of rows: `CheckToggle`, the item name 16/600, a mono "added" date in `ink-secondary` on the right (D7), and delete.
- Bought view: `Check` + "Bought by Jana", strike-through in `ink-muted`, plus a secondary "Return to list" button at 44px.

### 7.5 Notes (`/notes`)
Files: `features/notes/components/**`, `notes/{page,loading}.tsx`. Characterization tests come first, especially for the photo flow (yellow zone).

- Title "Notes" with a one-sentence description, and "Add note" as primary. The header card goes away; it uses `PageHeader.actions` like the other pages.
- One sheet of note rows, matching the Home note-row spec:
  - author 700, plus a mono timestamp right-aligned at 13px in `ink-muted`
  - text at 15/1.5 in `ink-secondary`
  - on desktop, a 150px author column with the text beside it
  - photo thumbnails underneath: 4px radius, no border, `bg-muted` placeholder
- Unavailable photo: an `ImageOff` icon plus text (today it's faint text).
- Lightbox: a native `<dialog>` with an `ink-primary/90` backdrop, keeping the 44px controls but at `rounded-control`. The counter is mono.

### 7.6 Auth pages, error pages, landing
- **Login / Signup** (`app/[locale]/(public)/*`, `PublicShell.tsx`, `auth/*Form.tsx`):
  - drop the warm radial gradient, which carries its own palette and raw hex
  - `bg-page`, with the wordmark top-left plus the language switcher
  - a centred sheet (`max-w-md`) with a display title, the new form controls, and a full-width primary button at 48px
  - the switch link becomes a `TextLink`
  - the "CC" logo tile is replaced by the wordmark
- **Error / not-found:** §5.3.
- **Landing:** per D3.

---

## 8. Implementation plan

Each step is one reviewable PR, ending in a suggested Conventional Commit. Every step also includes:
- the **standard checks**: `npm run lint` · `npm run typecheck` · `npm run test:run -- --project unit` (in the sandbox) · `npm run build`
- `npm run e2e` (asked for first, because it runs outside the sandbox) on any step that touches a page covered by E2E
- **visual checks**: Playwright screenshots of the affected pages at 360 / 768 / 1280px in **cs and en**, saved to `test-results/agent/` (never committed, deleted before finishing), shown to you in the PR summary
- a **grep gate** on the touched files:
  - no raw palette classes (`(stone|zinc|emerald|amber|red|blue|sky)-\d`, `bg-white`, `text-white`)
  - no `focus-visible:outline-none`
  - no `text-[…px]`
  - no `shadow-`
  - no `rounded-(lg|xl|2xl|3xl|4xl)`

| # | Step | Scope (files) | Extra verification |
|---|---|---|---|
| 0 | **Characterization tests** (🟡 zones; no styling) | New tests: `shared/ui/{Button,IconButton,Surface,StatusBadge,EmptyState,FilterNav,CollectionToolbar}.test.tsx`, `shared/ui/Form/FormComposer.test.tsx`, `shared/Toast/Toast.test.tsx`, `features/dashboard/components/{DashboardPresenceCard,DashboardWeatherCard,DashboardPreviewCards,DashboardStatsSection}.test.tsx`. They assert roles, names, text, hrefs and `aria-*`, **never classes**. | All tests pass on the current UI. |
| 1 | **Tokens, fonts, base layer** | `app/globals.css` (new `@theme` + temporary legacy aliases + the base rules in §3), `app/layout.tsx` (Schibsted Grotesk + Spline Sans Mono with `latin-ext`; drop Geist and the body's hard-coded classes), `.storybook/preview.tsx`. Applies the type-scale override (D4). | Screenshots of every page; Czech diacritics now render in the brand font. Contrast table re-checked in the PR. |
| 2 | **App shell** | §4.1 files; `AppNav.test.tsx` and `LanguageSwitcher.test.tsx` updated (D8); new i18n keys if needed (account menu). | Keyboard walk: skip link → nav → language → avatar menu → main. `aria-current` and `aria-pressed` checked. Tab bar at 320px in cs, with labels wrapping. E2E `login.spec`. |
| 3 | **Primitives A: buttons, links, surfaces, headers** | `Button`, `IconButton` (+ required `aria-label`), new `TextLink`, `Surface`, new `RowList`, `SectionHeader`, `page/PageHeader`, `PageContent`, `PageLayout`, `PageFeedback`; stories updated or added. Set `a11y.test` to `"error"` in `.storybook/preview.tsx` (D6). | `npm run test:run -- --project storybook` (Chromium, outside the sandbox; I ask first); all feature tests (consumers unchanged). Page-level a11y is checked by keyboard walks and the contrast table, since there is no axe in E2E. |
| 4 | **Primitives B: status, filters, empty, skeleton, toast** | `StatusBadge` → `StatusLabel` (+ alias), `FilterNav`, `CollectionToolbar`, `EmptyState`, new `Skeleton`, `shared/Toast/*`; stories. | E2E for the toast `role="status"` and "Undo"; Storybook a11y. |
| 5 | **Forms** | `shared/ui/Form/*`, `FieldLabel`, `FormMessage`, new `CheckToggle` (+ story). Feature toggles switch to it. | All form tests (`New*Form.test.tsx`, Login/Signup). Keyboard: each field focus ring, error shown with icon and text. |
| 6 | **Home** | §7.1. Deletes `dashboardAccentStyles.ts`, `DashboardSummaryCard.tsx`, `DashboardEmptyState.tsx` (ask first). i18n statement keys in cs and en. | Step 0 tests still pass, plus new layout assertions; streaming still works (sections arrive independently, checked by throttling in a browser check); `login.spec` (h1 "Home"). |
| 7 | **To-dos** | §7.3. `TaskDueDate.test.tsx` updated to danger for overdue (D8). | Unit tests; screenshots of overdue, today and done states in cs. |
| 8 | **Supplies** | §7.4 | `shopping-create-and-undo.spec`. |
| 9 | **Notes** | §7.5 | Note tests; manual lightbox keyboard check (arrows, Esc, focus return). |
| 10a | **Calendar: toolbar, agenda, panels, cards** | `VisitsCalendar`, `VisitsCalendarToolbar`, `VisitsAgendaView`, `VisitsSelectedDayPanel`, `VisitsWeekMobilePanel`, `visit/*`; delete `visit-status-tone.ts` | `visits-*.spec` E2E. |
| 10b | **Calendar: month** | `month/*`, `VisitsCalendarSkeleton` | `VisitsMonthView` / `DayCell` tests (button counts unchanged); arrow-key grid navigation by hand. |
| 10c | **Calendar: week** | `week/*` | `VisitsWeekView` / `DayContent` tests. |
| 11 | **Auth, error, not-found, landing pass** | §7.6 | Login/Signup and home tests; `login.spec`. |
| 12 | **Cleanup + guard** | Remove the legacy token aliases and `nav-*`. Delete `StatCard` and `PageSection` (ask first). Add `tests/design-tokens.test.ts` (unit project, no dependencies): it walks `app/`, `features/` and `shared/` and fails on raw palette classes, `focus-visible:outline-none`, `text-[Npx]`, `shadow-*` and legacy tokens. Update `AGENTS.md` (Conventions: "semantic Fjäll tokens only") and `context/progress-tracker.md`. | Full checks. The guard test fails if a raw class is planted temporarily. |
| 13 | **Dark mode** | `globals.css` dark block (§5.1), `color-scheme`. | Screenshots with `colorScheme: "dark"` in Playwright; contrast table in the PR. |

**Order rationale:**
- Tokens come first, and with aliases, so the app never looks broken between PRs.
- The shell comes before primitives because it's the most visible and the most isolated.
- Primitives come before pages so that each page PR is mostly deleting local styles.
- The calendar is last among pages because it's the largest and most test-pinned, so it's split into three.

**Out of scope** unless you ask:
- new weather fields (humidity, tonight, alerts)
- supply quantities
- a theme toggle
- landing-page relayout
- changing the date-format functions
- E2E visual-regression baselines (`toHaveScreenshot`), which could be added after step 12 once the UI is stable

---

## 9. Suggested commit (for this document only)

```
docs(design): add Fjäll design spec and migration plan

Inventory of current tokens/hard-coded styles and a 13-step,
PR-sized plan to migrate the UI to the Fjäll design system.
```
