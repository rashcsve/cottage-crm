---
paths:
  - "e2e/**"
  - "lib/e2e/**"
  - "app/api/e2e/**"
  - "playwright.config.ts"
  - "scripts/playwright-web-server.mjs"
---

# E2E Infrastructure

- Playwright runs in mock mode only. Preserve the current `E2E_MOCKS=1` architecture, Chromium-only browser choice, single worker, and port `3100` unless the user explicitly asks to change them.
- E2E tests must not depend on real Supabase data. Keep the mock layer in `lib/e2e/` and the `/api/e2e/reset` route intact.
- Prefer browser automation only when it verifies an acceptance criterion, and prefer one full-page screenshot unless sticky or lazy UI behavior requires more.
- Store temporary browser artifacts under `test-results/agent/` and do not commit them.
- Do not remove or bypass mock reset helpers just to make tests pass.
