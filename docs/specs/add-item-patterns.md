# Add-item patterns

## Goal

Make adding items fast and calm, with no scroll jumps. The form appears where the user's attention already is.

- **Quick-add rows** for simple, frequent lists (Shopping, Tasks): always visible to admins. Enter adds the item, and focus stays for the next one.
- **Add panel** for richer forms (Notes, Visits): a right-hand drawer on `lg+` and a bottom sheet below `lg`, both built on native `<dialog>`.
- Remove the inline `FormComposer` + `useComposerScroll` pattern once nothing uses it.

Background: the inline "Add → composer under the toolbar → scroll to it" pattern causes competing scrolls (open, chunk swap, focus) and layout shift. It also puts the Visits form far from the calendar it depends on. Performance Task 2 (lazy-loaded forms) is stashed as `stash@{0}` and is redone on top of this pattern in Task 7.

## Scope

| Feature | Fields today | New pattern |
|---|---|---|
| Shopping | `title` | Quick-add row at the top of the pending list |
| Tasks | `title`, `description`, `priority`, `dueDate` | Quick-add row (title) with a "Details" disclosure for the other fields |
| Notes | `content`, photos | Add panel (modal on all sizes) |
| Visits | `visitorName`, `dateFrom`, `dateTo`, `note` | Add panel: **non-modal** drawer on `lg+` so the calendar stays clickable for picking the range; modal bottom sheet below `lg` |

Behaviour rules (also added to `docs/design/fjall-design-spec.md` §4 as "Adding items"):

- **Never scroll the page to reveal a form.** Quick-add rows are already in view. Panels and sheets overlay the page.
- **Focus.** Opening a panel focuses its first field. Closing it (Close, Escape, backdrop click on a modal, or success) returns focus to the trigger. A quick-add field keeps focus after a successful add.
- **Unsaved input.** Closing a panel whose form `isDirty` asks first, with an inline confirmation inside the panel ("Discard note?" / Discard / Keep editing), not `window.confirm`. A quick-add row has no close, so its text simply stays.
- **Errors.** Field errors appear under the field (`aria-describedby`). The text is kept and focus stays on the field. Form-level errors use `FormMessage`, as today.
- **Pending.** Submit is blocked while pending, so Enter can't double-submit. The button shows the existing pending state.
- **Success.** Quick-add rows: no toast; a polite `aria-live` region inside the row announces "Added: {title}". Panels: the existing toast after the panel closes. No `router.refresh()`: the add actions call `revalidatePath`, which returns the fresh page in the action response. Visits keeps its optimistic merge (`.claude/rules/visits-calendar-exceptions.md`).
- **Permissions.** Viewers never see quick-add rows or Add buttons and never download form code.
- **Filters.** Shopping quick-add shows only on `pending`; Tasks only on `open`. This matches today's Add-button gating.

## Out of scope

- Optimistic add with Undo for Shopping/Tasks (possible follow-up; needs rollback design).
- Natural-language parsing ("milk tomorrow").
- A floating action button on mobile.
- Drag-to-create on the calendar beyond today's draft-range selection.
- Android hardware-back closing the sheet (would need history entries; conflicts with the calendar's manual history).
- Any server action, schema, RLS or `requireAdmin()` change. Actions are reused as they are: `addShoppingItemAction`, `addTaskAction`, `addNoteAction`, `createVisitAction`.

## Decisions (recommended defaults; confirm before the tasks that depend on them)

1. **Quick-add bundle.** An always-visible RHF + Zod form puts ~75 KB back into admins' initial JS. Recommended: keep the `AGENTS.md` form convention (RHF + `zodResolver`) and load the quick-add with `next/dynamic`, rendered only when `canManage`. Viewers pay nothing, and admins see a static input-shaped placeholder until the chunk arrives. Rejected: a plain `<form>` without RHF, which would need an `AGENTS.md` exception.
2. **Scrim token.** Add `--color-scrim` to `app/globals.css` (and to the design spec's tokens) for the `::backdrop` of the modal panel. Recommended `rgb(27 36 40 / 0.4)` (ink-primary at 40%). The panel itself stays a flat surface with no shadow; separation comes from the scrim on mobile and a 1px `border-l border-border` on the desktop drawer.
3. **Visits on `lg+`: non-modal drawer.** Opened with `dialog.show()`, not `showModal()`, so the calendar stays interactive. Escape still closes it. Focus isn't trapped, but Tab order goes panel → page, and the panel has `aria-labelledby`.

## Files & interfaces

| Area | Files | Zone |
|---|---|---|
| Design rules + token | `docs/design/fjall-design-spec.md`, `app/globals.css` | 🟢 |
| Shared panel | new `shared/ui/AddItemPanel.tsx` + `.stories.tsx` + `.test.tsx` | 🟡 (new component; stories required) |
| Dirty-close confirm | inside `AddItemPanel` | 🟡 |
| Shopping quick-add | new `features/shopping/components/forms/ShoppingQuickAdd.tsx`, `ShoppingPageBody.tsx`, `ShoppingToolbar.tsx` | 🟡 (characterization tests first) |
| Tasks quick-add | new `features/tasks/components/forms/TaskQuickAdd.tsx` (reuses `NewTaskForm` field markup or replaces it), `TasksPageBody.tsx`, `TasksToolbar.tsx` | 🟢 |
| Notes panel | `NotesPageBody.tsx`, `NewNoteForm.tsx` | 🟡 (characterization tests first) |
| Visits panel | `VisitsCalendar.tsx`, `NewVisitForm.tsx` | 🟢 (follow calendar exception rules) |
| Cleanup | `shared/ui/Form/FormComposer.tsx`, `shared/hooks/useComposerScroll.ts`, `CollectionToolbar.tsx` (`primaryAction` may become unused for Shopping/Tasks) | 🟡 |
| i18n | `i18n/locales/cs.json`, `en.json` | 🟢 |

```ts
// shared/ui/AddItemPanel.tsx
interface AddItemPanelProps {
  open: boolean;
  onClose: () => void;           // called after Escape/Close/backdrop, once any dirty-confirm passes
  title: string;
  titleId: string;
  closeLabel: string;
  modal?: boolean;               // default true; false => dialog.show() on lg+, still modal sheet below lg
  isDirty?: boolean;
  discard: { message: string; confirmLabel: string; cancelLabel: string };
  children: ReactNode;
}

// features/shopping/components/forms/ShoppingQuickAdd.tsx
export function ShoppingQuickAdd(): JSX.Element;

// features/tasks/components/forms/TaskQuickAdd.tsx
export function TaskQuickAdd(): JSX.Element;   // title + disclosure (aria-expanded button) for description/dueDate
```

New i18n keys (both locales): `shopping.quickAdd.{label,placeholder,submit,added}`, `tasks.quickAdd.{label,placeholder,submit,showDetails,hideDetails,added}`, `common.addPanel.{discardConfirm,discardCancel}`, `notes.form.discardMessage`, `visits.form.discardMessage`.

## Tasks

### 1. Write the "Adding items" design rules and the scrim token
Status: done · Blocked by: none · Zone: 🟢

- Add §4 "Adding items" to `docs/design/fjall-design-spec.md`, covering the behaviour rules above. Add `--color-scrim` to the token list and to `app/globals.css`.
- Accept: `tests/design-tokens.test.ts` green, and the token is usable as `bg-scrim` / in `::backdrop`.

### 2. Shopping quick-add row
Status: done · Blocked by: 1 · Zone: 🟡 (characterization tests for current add flow first)

- Characterize first: today's `ShoppingPageBody` add flow (admin sees Add; viewer doesn't; submit calls the action, toasts, refreshes; server field error shown).
- `ShoppingQuickAdd`: a single `TextField` (visible label kept or `sr-only` with a visible submit button; placeholder isn't a label), `enterKeyHint="enter"`, RHF + `createShoppingItemSchema`, `mode: "onSubmit"` for this one-field form so blur doesn't nag. On success: clear, keep focus, toast, no `router.refresh()`. On error: keep text, show the field error, keep focus.
- It sits as the first row in the pending list card (hairline-separated, per the "sheet" rule), above the empty state when the list is empty.
- Remove the Shopping toolbar Add button and the composer.
- Loaded via `next/dynamic` only when `canManage` (Decision 1), with an input-shaped placeholder.
- Accept: add 3 items in a row with the keyboard only, no mouse and no scroll movement; viewers see no row and request no form chunk; tests pass.

### 2b. Shopping quick-add: live-region announcement instead of a toast
Status: done · Blocked by: 2 · Zone: 🟡

- Update the `ShoppingQuickAdd` tests first: success shows no toast, and the live region contains "Added: {title}".
- Remove the success toast from `ShoppingQuickAdd`. Render a visually hidden `role="status"` (`aria-live="polite"`) element in the row from the first render, so screen readers pick up later changes. On success, set its text to `shopping.quickAdd.added` with the item title (cs "Přidáno: {title}", en "Added: {title}"). Adding the same title twice must announce again: the text sits in a keyed child that remounts on every add.
- Errors are unchanged: they show under the field.
- Accept: with a screen reader, every add is announced once; no toast appears; tests pass in both locales.

### 3. Tasks quick-add with details
Status: done · Blocked by: 2 · Zone: 🟢

- `TaskQuickAdd`: a title field plus a "Details" toggle button (`aria-expanded`, `aria-controls`) revealing description and due date inline. No priority field (decided 2026-10-27): every quick-added task uses the schema default `priority: "medium"`. Enter in the title submits with defaults (no due date). Details stay open after an add if they were open; a server error on a hidden detail field opens them.
- Placement: its own card directly under the toolbar, above the task groups (not inside the "Needs attention" group).
- Title `min(3)` errors show under the field without losing text.
- Success follows Task 2b: no toast, and the live region announces `tasks.quickAdd.added`.
- Remove the Tasks toolbar Add button and the composer. Lazy-load as in Task 2.
- Accept: a title-only add works with Enter; an add with details works with the keyboard; tests for both and for the server field error.

### 4. Shared `AddItemPanel`
Status: todo · Blocked by: 1 · Zone: 🟡

- Native `<dialog>`. Below `lg` it's a bottom sheet (full width, max-height ~90dvh, internal scroll, safe-area padding, `showModal()`). On `lg+` it's a right drawer (~28rem, full height under the 72px header, `showModal()` or `show()` per `modal`).
- Escape and the Close button route through the dirty check. The inline discard confirmation sits inside the panel. Backdrop click closes the modal variant only.
- Focus goes to the first focusable field on open and returns to the opener on close (store `document.activeElement` on open).
- Reduced motion: no slide animation, just appear.
- Stories: modal sheet, desktop drawer, non-modal drawer, dirty-confirm state; `addon-a11y` must pass.
- Accept: component tests for open/close, Escape, dirty-confirm (discard and keep), focus in/out, `modal={false}` leaving the page interactive.

### 5. Notes in the panel
Status: todo · Blocked by: 4 · Zone: 🟡 (characterization tests first)

- Characterize `NotesPageBody` + `NewNoteForm` (content + photos) as they are today.
- Open `NewNoteForm` in `AddItemPanel` (modal) from the existing Add button, passing `isDirty` (content or photos selected). Lazy-load the form inside the panel; reuse `FormComposerLoadBoundary` from `stash@{0}` for chunk-load errors.
- Accept: photo picking works inside the sheet on mobile widths; discard confirm appears when content or photos exist; focus returns to Add.

### 6. Visits in the panel
Status: todo · Blocked by: 4 · Zone: 🟢 (read `.claude/rules/visits-calendar-exceptions.md` first)

- `NewVisitForm` moves into `AddItemPanel` with `modal={false}` on `lg+`, so draft-range selection on the calendar keeps working while the form is open, and the date fields stay in sync with `draftRange`. Below `lg` it's a modal sheet; dates are edited in the form fields.
- All existing triggers (toolbar, selected-day panel, week-day hover action, mobile day panel) open the same panel, pre-filled from the clicked day.
- Keep the optimistic merge and manual history unchanged; panel state must survive view/date changes exactly as `isDraftMode` does today.
- Accept: on desktop, open from a day, click another day to extend the range, and the form updates without the calendar moving; on mobile, the sheet opens from the day panel; existing visits tests pass.

### 7. Remove the inline composer and redo lazy-loading
Status: todo · Blocked by: 2, 3, 5, 6 · Zone: 🟡

- Delete `FormComposer`/`FormComposerSkeleton`/`useComposerScroll` and any unused `CollectionToolbar.primaryAction` code if nothing imports them (ask before deleting multiple files).
- From `stash@{0}`, re-apply what still fits: `FormComposerLoadBoundary` (rename it if it now wraps panels), `useComposerFocusReturn` (or drop it if the panel owns focus return), `tests/utils/spied-dynamic.ts`, the `*.lazy.test.tsx` approach. Re-measure bundle sizes with the method in `docs/specs/performance.md` and update its Task 2 result.
- Accept: no imports of the removed modules; performance numbers recorded; all checks green.

## Testing

| Behaviour | Layer |
|---|---|
| Quick-add: Enter adds, clears, keeps focus; error keeps text and focus; no double submit | Component (`ShoppingQuickAdd`, `TaskQuickAdd`) with mocked actions |
| Quick-add success: no toast, live region announces the title (also when the same title is added twice) | Component (`ShoppingQuickAdd`, `TaskQuickAdd`) |
| Viewers never render quick-add or Add buttons, never load the chunk | Component (`*PageBody`) with spied `next/dynamic` |
| Tasks details disclosure (`aria-expanded`, fields included in submit) | Component |
| Panel open/close, Escape, backdrop, dirty-confirm, focus in/out, non-modal interactivity | Component (`AddItemPanel`) + Storybook a11y stories |
| Visits draft range syncs with the panel's date fields on `lg+` | Component (`VisitsCalendar`) |
| Notes photos inside the panel | Existing `NewNoteForm` tests, adapted (not weakened) |
| Full add flows on all four pages | E2E (mock layer); run outside the sandbox, ask first |

## End-to-end check

1. `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build` pass.
2. Admin, desktop: Shopping, type 3 items with Enter only, and the page never scrolls. Tasks, add one with title only and one with details. Notes, the drawer opens, typing then Escape asks to discard. Visits, the drawer opens from a day, clicking another day extends the range.
3. Admin, 390px width: the same flows. Notes and Visits open as bottom sheets, the keyboard doesn't hide the submit button, and focus returns to the trigger on close.
4. Viewer: no quick-add rows or Add buttons, and no form chunks in the Network tab.
5. Keyboard-only and reduced-motion pass in both locales; Czech labels wrap without truncation.
