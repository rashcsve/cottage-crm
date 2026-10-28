# Optimistic counts on delete

## Goal

When a user deletes a task, shopping item or note, every count on the page drops at the same moment the row disappears, and comes back together with the row on undo or a failed delete. Today the row is hidden immediately, but the counts keep the server values until the delete commits (after the 5 s undo window) and `router.refresh()` returns.

## Cause

`useOptimisticRemoveList` runs inside the list components (`TaskList`, `ShoppingList`, `NoteList`). The counts are rendered above them from server data:

- Tasks: toolbar summary (open / overdue / done), filter nav values, toolbar total (`TasksPageBody`) and the group badges (`TaskGroup` counts its `tasks` prop, i.e. the server list).
- Shopping: filter nav values and toolbar total (`ShoppingPageBody`).
- Notes: header badge `notes.length` (`NotesPageBody`).

Visits already does it right: `useVisitsCollectionState` runs the hook at collection level and derives `stats` from the visible items. Follow that pattern.

## Scope

- Move the `useOptimisticRemoveList` call up from each list into its `*PageBody`; lists render the items and `onDelete` they receive.
- `useOptimisticRemoveList` additionally returns `isRemoved(id)`. Page bodies filter each server group with it (`data.overdueTasks.filter((task) => !isRemoved(task.id))`) instead of flattening, re-filtering and rebuilding page data. No per-feature optimistic hooks.
- Counts on the page are the `.length` of the filtered groups. Client components stop reading the `*Count` fields (they always equal the lengths: `categorizeTasksForPage`, `getShoppingPageData`), so values without a pending delete are unchanged.
- Groups are filtered, never recomputed on the client: re-running `categorizeTasksForPage` would need "today" and could disagree with the server around midnight/timezones.
- Undo, commit failure (restore + error toast + retry), `pagehide` flush, toasts and `router.refresh()` after a successful commit behave exactly as today.

## Out of scope

- Optimistic toggles (task done, shopping purchased). They stay server-confirmed: spinner, action, `router.refresh()`.
- Visits (already correct).
- Other changes to `useOptimisticRemoveList` beyond the additive `isRemoved` (agreed; 🟡 — existing tests stay green, one new test).
- A shared wrapper for the action/messages/`router.refresh()` setup: it is per-feature configuration, kept inline.
- `React.useOptimistic`: it resets when the action's transition ends, so it can't hold a row hidden through the 5 s undo window.
- Server actions, revalidation, queries, page data shape. Removing the redundant `*Count` fields from the types (dashboard and e2e mocks read them) is a possible follow-up.

## Files & interfaces

| Task | Files | Zone |
|---|---|---|
| 1 Tasks | `shared/hooks/useOptimisticRemoveList.ts` (+ test, additive `isRemoved`), `features/tasks/components/{TasksPageBody,TaskGroup,TaskList}.tsx` (+ tests) | 🟡 shared / 🟢 tasks |
| 2 Shopping | `features/shopping/components/{ShoppingPageBody,ShoppingGroup,ShoppingList}.tsx` (+ tests) | 🟡 |
| 3 Notes | `features/notes/components/{NotesPageBody,NoteList}.tsx` (+ tests) | 🟡 |
| 4 Docs | `AGENTS.md` Conventions line on optimistic flows (currently "see `ShoppingList`") | 🟢 |

Interfaces (shape, names may change during implementation):

```ts
// Shared hook: additive return value
interface UseOptimisticRemoveListResult<TItem, TId> {
  items: TItem[];
  removeItem: (item: TItem) => void;
  isRemoved: (id: TId) => boolean; // new
}

// Page body (tasks; shopping is the same over pendingItems + purchasedItems)
const { removeItem: removeTask, isRemoved } = useOptimisticRemoveList({
  items: allTasks, // openTasks + doneTasks
  commitRemove: (task) => deleteTaskAction({ taskId: task.id }),
  messages, onCommitSuccess: () => router.refresh(),
});
const overdueTasks = data.overdueTasks.filter((task) => !isRemoved(task.id));
// ...value={overdueTasks.length}

// Lists become presentational
interface TaskListProps { tasks: Task[]; onDelete: (task: Task) => void; /* rest unchanged */ }
interface ShoppingListProps { items: ShoppingItem[]; onDelete: (item: ShoppingItem) => void; /* rest unchanged */ }
interface NoteListProps { notes: Note[]; onDelete: (note: Note) => void; /* rest unchanged */ }
```

Notes need no new hook: `NotesPageBody` calls `useOptimisticRemoveList` directly and uses the visible notes for the badge and the list.

## Behaviour notes

- Tasks: a task is in exactly one of overdue / on track (both inside open) or done. Removing it lowers every count that includes it (e.g. an overdue task lowers overdue **and** open).
- Tasks: removing the last overdue task switches the open view from the "overdue + on track" layout to the single "open" group immediately (today: after the refresh). This is intended.
- Shopping/Tasks: the hook covers both filters' items, and switching the filter only changes `searchParams`, so `*PageBody` stays mounted and a pending delete survives a tab switch (today the list for the other filter unmounts and takes its removal state with it). Covered by a test.
- Empty state: deleting the last visible row shows the existing empty state and the `role="status"` announcement, as today.
- Accessibility: counts are plain text that changes; no new live region (the toast already announces the delete). Focus after delete is lost to `<body>` as today (the row unmounts); when the last overdue task is deleted the whole overdue group unmounts too — same outcome, not worse. Moving focus to a sensible target is a possible follow-up.

## Tasks

### 1. Tasks: counts follow optimistic deletes
Status: done (reworked: shared `isRemoved` instead of a tasks hook) · Blocked by: none · Zone: 🟡 shared hook (additive) / 🟢 tasks

- Shared hook first: a failing test in `useOptimisticRemoveList.test.tsx` for `isRemoved` (true while pending, false after undo and after a failed commit); existing hook tests unchanged and green.
- Tests first (`TasksPageBody.test.tsx`, real `TaskGroup`/`TaskList`, mocked `deleteTaskAction`, fake timers): deleting an overdue task lowers the overdue and open summary values, the open filter value, the toolbar total and the overdue group badge immediately; undo restores all of them; a failed commit restores them and shows the error toast; after a successful commit `router.refresh()` is called once.
- Move the optimistic-remove tests from `TaskList.test.tsx` (undo, error rollback, retry, refresh) to the page/hook level; they must keep asserting the same behaviour — moved, not deleted or weakened.
- Accept: counts and rows change together on delete/undo/failure; all existing task tests green.

### 2. Shopping: counts follow optimistic deletes
Status: todo · Blocked by: 1 · Zone: 🟡 shopping (characterization tests first)

- First: characterization tests for `ShoppingPageBody` with the real `ShoppingGroup`/`ShoppingList` (rows, filter values, toolbar total per filter) as they work today.
- Then the same failing tests as Task 1: delete on the pending and on the purchased filter, undo, failed commit, refresh after commit.
- Move the optimistic-remove tests from `ShoppingList.test.tsx` as in Task 1. `ShoppingToggleButton` unchanged.
- Accept: as Task 1; E2E shopping delete flow still passes (mock layer supports it).

### 3. Notes: count follows optimistic deletes
Status: todo · Blocked by: 1 · Zone: 🟡 notes (characterization tests first)

- First: characterization tests for `NotesPageBody` with the real `NoteList` (badge, rows, empty state).
- Then failing tests: badge drops on delete, restores on undo and on failure; photo deletion behaviour unchanged.
- Accept: as Task 1.

### 4. Update AGENTS.md
Status: todo · Blocked by: 2, 3 · Zone: 🟢

- Conventions line: optimistic delete state lives in the page body and counts derive from visible items (see `features/visits/application/useVisitsCollectionState.ts`, `ShoppingPageBody`). Keep "call `router.refresh()` after the commit".

## Testing

| Behaviour | Layer |
|---|---|
| Counts drop on delete, restore on undo / failure | Component (`*PageBody.test.tsx`, real lists, mocked actions, fake timers) |
| `isRemoved` during pending / undo / failure | Shared hook test (`useOptimisticRemoveList.test.tsx`) |
| Count derivation (each task category, shopping per filter) | Component tests (`*PageBody` tests) |
| Undo / error rollback / retry / `router.refresh()` after commit | Moved from `*List.test.tsx` to page/hook tests, assertions unchanged |
| Lists render given items and call `onDelete` | Existing `*List.test.tsx`, reduced to presentation |
| Full delete flows | Existing E2E (mock layer) — run outside the sandbox, ask first |

## End-to-end check

1. `npm run lint`, `npm run typecheck`, `npm run test:run -- --project unit`, `npm run build` pass.
2. As admin on `/tasks`: delete an overdue task → overdue and open counts and the group badge drop at once; Undo → they come back; let it commit → counts stay, no flicker after the refresh.
3. On `/shopping`, both filters: delete → toolbar total and filter value drop at once; Undo restores.
4. On `/notes`: delete → header badge drops at once; Undo restores.
5. Simulate a failed delete (e.g. offline in DevTools) → row and count return together with the error toast.
6. Keyboard only: delete, then Undo from the toast; focus and announcements as before.
