---
paths:
  - "features/visits/application/**"
  - "features/visits/components/calendar/**"
  - "app/[locale]/(dashboard)/visits/**"
---

# Visits Calendar Exceptions

- Visits is the intentional exception to the default server-owned URL-state pattern.
- For high-frequency calendar navigation, preserve manual browser history through `useVisitsCalendarBrowserState` instead of switching to `useRouter().push()` if that change would trigger a server refetch on every click.
- Preserve the local optimistic merge in `useVisitsCollectionState`. Do not replace it with a blanket `router.refresh()` unless you also preserve the calendar's transient navigation, selection, and composer state.
- Extend the existing visits calendar abstractions before introducing new cross-feature state patterns.
