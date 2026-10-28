# Performance

How to measure bundle size and response time comparably, the current numbers, and the trade-offs accepted so far.

## How to measure

Measure in mock mode so numbers don't depend on a backend. In Claude Code's sandbox `next dev` fails with EMFILE, so always use a production build.

1. Build with the E2E mock env:

   ```bash
   E2E_MOCKS=1 NEXT_PUBLIC_E2E_MOCKS=1 NEXT_PUBLIC_APP_URL=http://localhost:3100 \
   NEXT_PUBLIC_SUPABASE_URL=https://e2e.supabase.test NEXT_PUBLIC_SUPABASE_ANON_KEY=e2e-anon-key \
   npm run build
   ```

2. Start it with the same env: `npx next start --hostname localhost --port 3100` (`localhost`, not `127.0.0.1` — the latter loops the cs rewrite).

**JS per route (gzipped):** for each route, take the union of `entryJSFiles["[project]/app/<route>/page"]` from its `.next/server/app/[locale]/…/page_client-reference-manifest.js` (page + its layouts' chunks), gzip each file at level 9 and sum. The framework runtime is `rootMainFiles` in `.next/build-manifest.json`; polyfills (`polyfillFiles`, legacy browsers only) are reported separately. Lazy chunks (`next/dynamic`) are not in the route number: sum the files per entry in `…/page/react-loadable-manifest.json`. 1 KB = 1024 bytes.

**TTFB:** `curl -w '%{time_starttransfer}'`, one warm-up request, then three sets of 5 runs; report the median of the three set medians. `/` and `/login` are measured signed out; dashboard routes with cookie `codex-e2e-auth=active`. `/overview` streams, so its TTFB is the shell only. Noise is about ±2 ms (±5 ms on `/tasks`).

Mock mode skips Supabase, so it shows render cost only. Auth and query changes must be checked against local Supabase or the demo deployment — never production data.

Keep temporary scripts and output in `test-results/agent/` and delete them afterwards.

## Current numbers

Measured 2026-10-28 on `main` @ `01cff51`.

| Route | JS gz | TTFB |
|---|---|---|
| `/` | 74.8 KB | 5.2 ms |
| `/overview` | 25.1 KB | 6.8 ms |
| `/tasks` | 31.1 KB | 13.0 ms |
| `/shopping` | 30.7 KB | 7.1 ms |
| `/visits` | 41.2 KB | 6.9 ms |
| `/notes` | 36.4 KB | 5.0 ms |
| `/login` | 99.6 KB | 4.3 ms |
| framework runtime (every page) | 117.5 KB | — |
| polyfills (legacy browsers only) | 38.6 KB | — |

| Lazy chunk | Loaded when | JS gz |
|---|---|---|
| Tasks quick-add row | admins, on page open | 78.3 KB |
| Shopping quick-add row | admins, on page open | 77.5 KB |
| `NewNoteForm` | opening the add panel | 79.6 KB |
| `NewVisitForm` | opening the add panel | 78.1 KB |

Viewers download only the route JS; admins also get the quick-add chunk on Tasks/Shopping after hydration.

## Accepted trade-offs

- **Note photo URLs are not cacheable.** `createSignedUrls` returns a new token on every request, so thumbnails (~20 KB each) are re-downloaded on each page load. Stable URLs would need signing with the service-role client (🔴 `lib/supabase`); a photo proxy API route was rejected (new API surface, and `next/image` optimizer fetches carry no cookies). Note photos are rendered `unoptimized`.
- **Revoked sessions pass the proxy until the JWT expires.** `proxy.ts` uses `getClaims()` (local check) instead of `getUser()`; every dashboard page still calls `getUser()` on the server before returning data. Depends on asymmetric signing keys (see README "Local Setup").
- **`note_photos.thumbnail_path` has no CHECK constraint.** An admin could point it at another object in the `note-photos` bucket; admins can already delete any object there, so it grants nothing new. A constraint (`thumbnail_path = storage_path || '.thumb.webp'` or `'.thumb.jpg'`) would close it if wanted.

## Revisit when

- Data grows to thousands of rows per table: add pagination to Tasks/Shopping/Notes/Visits, and consider an index on `visits.date_to` (the overview filters `date_to >= today`; `/visits` fetches every visit).
- Supabase's Performance Advisor flags a query.
- Translations grow a lot: `NextIntlClientProvider` sends all messages to every page (server-only namespaces were ~1–1.5 KB gz in 2026-10; not worth a hand-kept namespace list then).
