# "Today" in the cottage's time zone

Status: draft — found 2026-10-28 during the performance review; open decision below. Run the `spec` skill to finalize before starting.

## Goal

Every "today" in the app is the Prague calendar date, on the server and in the visits calendar, so near midnight the overview, tasks and visits agree with each other and with the user.

## Problem

- `toDateOnlyString()` (`lib/utils/date.ts`) uses `getUTC*`. Server "today" is `toDateOnlyString(new Date())`, so between 00:00 and 01:00 (winter) / 02:00 (summer) Prague time the server still treats yesterday as today.
- `features/visits/application/calendar/useCalendarTodayIso.ts` uses the browser's local time zone (`Intl.DateTimeFormat("en-CA")`), so near midnight the calendar's "today" can differ from the server's.
- Symptoms in that window: wrong "at the cottage now" / next visit on the overview, a task due today shown as not yet due or yesterday's tasks not yet overdue, and possibly a visit starting "today" rejected or accepted wrongly by the action.

## Scope

- One helper, e.g. `getTodayIso(timeZone = "Europe/Prague")` in `lib/utils/date.ts`, using `Intl.DateTimeFormat` with `timeZone`.
- Use it at every server "today" call site, and in the calendar hook so both sides agree.
- Leave `toDateOnlyString()` unchanged: it is also used for pure date-only arithmetic, where UTC is correct.

**Decision needed:** fixed `Europe/Prague` (family cottage, one time zone), or the viewer's time zone (needs it sent from the client). Recommendation: fixed `Europe/Prague`.

## Out of scope

- Changing how dates are stored (date-only strings stay as they are).
- Time-of-day display.

## Files & interfaces

| Area | Files | Zone |
|---|---|---|
| Helper | `lib/utils/date.ts` (+ test) | 🟢 |
| Server "today" call sites | `app/[locale]/(dashboard)/overview/(index)/page.tsx` (passes `todayIso` to `startDashboardStreaming()`), `features/tasks/server/get-tasks-page-data.ts` (overdue / due today via `features/tasks/domain/predicates.ts`), `features/visits/server/get-visits-page-data.ts`, `features/visits/server/actions.ts` (validation against today) | 🟢 visits/tasks, 🟡 dashboard |
| E2E mock data | `lib/e2e/mock-data.ts` | 🟡 |
| `new Date()` defaults to check | `features/tasks/domain/category-filters.ts`, `features/shopping/shared/formatShoppingDate.ts`, `features/dashboard/components/DashboardPreviewCards.tsx` | 🟢 tasks, 🟡 shopping/dashboard |
| Calendar | `features/visits/application/calendar/useCalendarTodayIso.ts` | 🟢 (read `.claude/rules/visits-calendar-exceptions.md`) |

```ts
// lib/utils/date.ts
export function getTodayIso(now?: Date, timeZone?: string): string; // "YYYY-MM-DD" in timeZone, default Europe/Prague
```

## Tasks

1. Helper — `getTodayIso` with tests. Blocked by: decision. Zone: 🟢
2. Server call sites — switch every server "today" to the helper. Blocked by: 1. Zone: 🟢/🟡 (characterization tests first for dashboard and `lib/e2e`)
3. Client defaults and calendar hook — use the same helper so server and calendar agree. Blocked by: 1. Zone: 🟢/🟡

## Testing

| Behaviour | Layer |
|---|---|
| 23:30 UTC in winter and summer → next Prague date; around DST changes | Unit (`lib/utils/date.test.ts`) |
| Visit starting "today" accepted at 00:30 Prague time | Action test with fake timers |
| Task due yesterday is overdue at 00:30 Prague time | Page-data / predicate test with fake timers |
| Calendar "today" matches the server | Hook test with fake timers |

## End-to-end check

- At 00:30 Prague time (fake clock or real), the overview, tasks and visits all treat the Prague date as today, and the server and calendar agree.
