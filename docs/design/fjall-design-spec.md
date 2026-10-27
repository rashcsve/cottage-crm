# Chata CRM — "Fjäll" design spec

**Mood:** Birch, cold morning light and one walnut brown — the colour of the cottage wood. Nothing on the table that doesn't need to be there.
**Principles:** Structure comes from whitespace and hairlines, not boxes. One accent colour. Monospace for anything that's data: dates, counts, temperatures, quantities. Status is always shown with an icon and words, never colour alone.

---

## 1. Tokens (Tailwind v4 `@theme`)

```css
@theme {
  /* Surfaces */
  --color-page:    #F5F6F3;  /* birch-grey app background */
  --color-surface: #FFFFFF;  /* cards / sheets */
  --color-muted:   #ECEEEA;  /* subtle fills, hover, skeletons */
  --color-border:  #DDE1DC;  /* hairlines, dividers */
  --color-scrim: rgb(27 36 40 / 0.4); /* ink-primary at 40%; modal ::backdrop only */

  /* Ink */
  --color-ink-primary:   #1B2428; /* 14.6:1 on page */
  --color-ink-secondary: #3D4A50; /*  8.4:1 */
  --color-ink-muted:     #5A676D; /*  5.4:1 — smallest allowed text colour */
  --color-ink-faint:     #A3ACAA; /* rules & decorative icons ONLY, never text */

  /* Accent + status (all ≥ 4.5:1 on page AND surface) */
  --color-accent:  #6B3F24; /* walnut brown (cottage wood), 8.2:1 */
  --color-accent-hover: #4A2E1B;
  --color-on-accent: #FFFFFF;
  --color-success: #2F6B4A; /* 5.8:1 */
  --color-warning: #8A5A00; /* 5.5:1 */
  --color-danger:  #B0322A; /* 5.8:1 */

  /* Shape */
  --radius-card: 4px;
  --radius-control: 4px;
  --shadow-card: none;       /* no shadows anywhere */

  /* Type */
  --font-sans: "Schibsted Grotesk", system-ui, sans-serif;
  --font-mono: "Spline Sans Mono", ui-monospace, monospace;

  --text-xs: 13px;  --text-xs--line-height: 1.4;
  --text-sm: 15px;  --text-sm--line-height: 1.5;
  --text-base: 16px; --text-base--line-height: 1.5;
  --text-lg: 17px;
  --text-xl: 20px;  /* section headings */
  --text-2xl: 28px;
  --text-3xl: 36px; /* presence statement (desktop) */
  --text-display: 48px; /* page title mobile 40px, desktop 56px */
}
```

Fonts come from Google Fonts: Schibsted Grotesk 400–800 and Spline Sans Mono 400–600. Both cover Czech diacritics.

---

## 2. Typography rules

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Page title ("Home") | Schibsted | 40 mobile / 56 desktop, 700 | letter-spacing −0.03em, line-height 1 |
| Page description | Schibsted | 16 / 18, 400, ink-secondary | max-width ~640px |
| Section label (e.g. "At the cottage now") | Schibsted | 13, 600, ink-muted | sentence case, NOT uppercase |
| Section heading ("Latest notes") | Schibsted | 20–22, 700 | −0.01em |
| Statement ("Petr & Jana are there.") | Schibsted | 30 / 36, 700 | −0.02em, written as a sentence |
| Body / list item | Schibsted | 15–16, 400–600 | |
| Data (dates, counts, °C, quantities, times) | Spline Sans Mono | 13–15 (counts 22–40) | numbers use −0.04em at large sizes |

Copy tone: plain sentences ("Nobody right now.", "Petr & Jana are there.") rather than labels plus values.

---

## 3. Layout

- **Page container:** max-width 1180px, padding 40px desktop and 20px mobile. Section gap is 28px on mobile and 36–48px on desktop.
- **Home has no visible page title.** The h1 and description are screen-reader only; the presence label carries today's date instead ("Monday, October 26 · at the cottage").
- **Desktop Home:** two columns using flex-wrap. It fits 1440×900 and 1280×720 without vertical scrolling.
  - **Left column** (`flex: 1 1 340px`): presence, next arrival, primary CTA, weather.
  - **Right column** (`flex: 2 1 560px`): to-dos and supplies in a 2-column auto-fit grid (`minmax(280px, 1fr)`, headers aligned with subgrid), then notes at full width.
- **Mobile Home:** one column ordered by what needs action: presence → next arrival → CTA → to-dos → supplies → notes → weather, with the bottom tab bar after them. Weather moves to the end with CSS `order`. That's safe only because the card holds nothing focusable.
- Leave room for Czech text, which runs 20–30% longer. Never truncate nav labels, wrap them instead. Every row must cope with a two-line title.

---

## 4. Components

### App shell
- **Desktop top nav:** height 72px with a 1px border-bottom. Contents from left to right:
  - Wordmark `chata.`, 800 weight, with the full stop in accent.
  - Text links, 15px, 28px apart. The active link is ink-primary 700 with a 2px accent bottom border running the full header height. Inactive links are ink-secondary 500.
  - Right side:
    - Weather chip: mono "12°C" with the Lucide `cloud-sun` icon.
    - Language switcher: mono "CS · EN", where the active one is underlined and `aria-pressed`.
    - User avatar: a 36px square in ink-primary with white initials, radius 4.
- **Mobile bottom tab bar:** surface background with a 1px top border and 5 equal columns. Each tab has a 22px Lucide icon (stroke 1.75) above a 12px label, at least 60px tall. The active tab is accent-coloured with a 3px accent bar on its top edge and `aria-current="page"`.
- **Mobile top bar:** wordmark on the left. On the right: weather chip, language button and a 44px avatar.

### Card ("sheet")
- Surface white on the page grey, radius 4px, **no border, no shadow**.
- Internal padding is 16–18px on mobile and 20–24px on desktop.
- Content inside a card is split into rows by 1px border hairlines, never by nested boxes.

### Counts
- Home has no stats strip. It repeated the preview sections below it. Counts sit under each section heading instead: mono 15px ink-secondary ("2 open", "1 to buy"). Extra state follows on the same line, e.g. "⚠ 1 overdue" in danger 600 with the `triangle-alert` icon. A count of 0 is hidden, because the empty state already says so.

### Buttons and links
- **Primary:** accent fill, white text, radius 4, at least 44px tall (48 for full-width), 15–16px weight 600. It may carry a trailing `arrow-right` icon placed with `justify-content: space-between`.
- **Secondary:** transparent with a 1.5px ink-primary border and ink-primary text, otherwise the same as primary.
- **Text link:** accent colour, 600, with a trailing `arrow-right` 16px icon and at least 44px of hit area. Hover uses accent-hover.
- **Focus (everything):** `outline: 2px solid var(--color-accent); outline-offset: 2–3px`. Never remove it.

### Status (never colour alone)
| State | Colour | Icon (Lucide) | Text example |
|---|---|---|---|
| Overdue | danger | `triangle-alert` | "Overdue since 12 Oct" |
| Due today | warning | `clock` | "Due today" |
| Future date | ink-secondary, mono | (none or `calendar`) | "Due Fri 23 Oct" |
| Occupied | success | `log-in` | "Occupied" |
| Weather alert | warning | `triangle-alert` | "Frost warning tonight — drain the outdoor tap." |
Priority is shown as plain words in ink-secondary ("High priority"), not with colour.

### Preview cards (notes / to-dos / supplies)
- Each is a section heading (20–22px, 700) with a text link on the right ("All notes →"), then a white sheet holding hairline rows.
- **Note row:** author (700) on the left and a mono relative time (13px, ink-muted) on the right, with the text below in ink-secondary at 15px / 1.5. On desktop the author and time stack in a fixed 150px column and the text sits beside it.
- **To-do row:** the whole row is a link. Title is 16px 600, with the due status below at 13px. Home shows no priority; the order already reflects it. Rows without a due date show only the title.
- **Supply row:** the item on the left; on the right, in ink-secondary 13px, who added it and a mono relative time ("Anna · 2 days ago"). There is no quantity field.
- **Times on Home:** relative ("2 hr. ago", "yesterday") below 7 days, then a short date ("Oct 19" / "19. 10."), always in a `<time dateTime>`.

### Weather card
- Mono 48–52px "12°" with the condition text right-aligned. Below a hairline, a 3-column grid of Wind / Humidity / Tonight, each a 13px muted label above a 15px mono value. An optional warning line goes at the bottom.

### Adding items
The form appears where the user's attention already is.
- **Quick-add row** for simple, frequent lists (Shopping, Tasks): the first hairline row of the list sheet, always visible to admins. Enter adds the item and focus stays in the field for the next one.
- **Add panel** for richer forms (Notes, Visits): native `<dialog>`. Below `lg` it's a bottom sheet (full width, max-height ~90dvh, internal scroll, safe-area padding). On `lg+` it's a right drawer (~28rem, full height under the 72px header). Flat surface, no shadow: separation comes from the `scrim` backdrop on modal panels and a 1px `border-l border-border` on the drawer. A non-modal drawer (Visits on `lg+`) leaves the page interactive.
- **Never scroll the page to reveal a form.** Quick-add rows are already in view; panels and sheets overlay the page.
- **Focus.** Opening a panel focuses its first field. Closing it (Close, Escape, backdrop click on a modal, or success) returns focus to the trigger. A quick-add field keeps focus after a successful add.
- **Unsaved input.** Closing a panel with a dirty form asks first, with an inline confirmation inside the panel ("Discard note?" / Discard / Keep editing), never `window.confirm`. A quick-add row has no close, so its text simply stays.
- **Errors.** Field errors appear under the field (`aria-describedby`); the text is kept and focus stays on the field. Form-level errors use `FormMessage`.
- **Pending.** Submit is blocked while pending, so Enter can't double-submit. The button shows its pending state.
- **Success.** A toast, then the list refreshes.
- **Permissions.** Viewers never see quick-add rows or Add buttons.
- **Reduced motion.** Panels appear without a slide animation.

---

## 5. Accessibility checklist
- All text is at least 4.5:1 against both page and surface; the ratios are listed in the tokens. ink-faint is never used for text.
- Touch targets are at least 44×44px, and tabs, rows and buttons are at least 48–60px tall.
- Status always pairs an icon with text, as in section 4.
- Use real `<a href>` and `<button>` elements, put `aria-current="page"` on the active nav item, `aria-pressed` on the language toggle, and `aria-label` on icon-only buttons and the avatar.
- Lucide icons get `aria-hidden="true"` when they're decorative.
- Set `lang="cs"` or `lang="en"` on `<html>` to match the active locale.
- Leave about 30% extra width for Czech strings; Czech dates are written "pá 23. 10.".

---

## 6. Not defined yet (decide during implementation)
- Dark mode (suggestion: page #12181B, surface #1A2226, ink #E8EDEE, accent #D4A27A, then re-verify contrast)
- Empty, loading and error states for each card
- Form controls (inputs, selects, checkboxes) — they should follow the 4px radius, 1.5px ink border and accent focus ring
