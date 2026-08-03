---
paths:
  - "features/dashboard/**"
  - "app/[locale]/(dashboard)/overview/**"
---

# Dashboard Streaming

- Dashboard overview is the intentional root-level Server Component exception. `app/[locale]/(dashboard)/overview/page.tsx` calls `startDashboardStreaming()` and passes promises into `DashboardOverview`.
- Preserve the Suspense-streamed overview structure unless the user explicitly asks for an architectural change.
- Keep client-side dashboard logic narrow. `ClientWeatherCard.tsx` is the main client leaf; avoid moving bulk dashboard data fetching into client components.
- When adding overview sections, prefer extending the existing streaming shape instead of collapsing back to one monolithic resolved payload.
