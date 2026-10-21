# Czech login redirect loop

Found while measuring Home for `fjall-migration.md` task 6: Czech (the default locale, served without a prefix) can't reach the login page in E2E mock mode, so cs pages can't be screenshotted or tested.

## Problem

Dev server in mock mode (`E2E_MOCKS=1`, port 3100, as started by `scripts/playwright-web-server.mjs`), no cookies:

| Request | Response |
|---|---|
| `GET /login` | 307 → `/login` (loops) |
| `GET /overview` | 307 → `/login` (then loops) |
| `GET /cs/overview` | 307 → `/cs/login` (then loops) |
| `/en/login`, `/en/overview` | work (E2E only uses `/en`, so this went unnoticed) |

Known so far (read-only investigation):
- `proxy.ts:37–40` `buildLoginUrl` keeps a `/cs` prefix, so `/cs/overview` → `/cs/login`. next-intl (`localePrefix: "as-needed"`, `i18n/routing.ts`) then redirects `/cs/login` → `/login`. That's an extra hop, not a loop, and it **also affects production**, because the Supabase branch (`proxy.ts:92`) uses the same function.
- Nothing found in code sends `/login` to itself. Candidates still open: the next-intl middleware response for the default locale, or a page-level redirect (`redirectIfAuthenticated()`, demo mode if `NEXT_PUBLIC_DEMO_MODE` is set locally).

## Goal

Every cs route reaches its page or the unprefixed `/login` in one redirect at most, in mock mode and with real Supabase auth. en behaviour is unchanged.

## Out of scope

- Changing `localePrefix`, `localeDetection` or the default locale.
- Changing auth, RLS, demo-mode session logic or the E2E mock layer beyond what the fix needs.

## Tasks

### 1. Reproduce and find the root cause
- Zone: 🟢 (no code changes)
- Blocked by: none
- Status: todo
- Start the mock-mode server and run `curl -sI` on `/login`, `/overview`, `/cs/overview`, `/cs/login`, with and without the `NEXT_LOCALE` cookie. Record the `Location`, `x-middleware-rewrite` and `x-nextjs-redirect` headers to tell proxy redirects from page redirects.
- Check whether demo mode is active locally, without printing `.env*` (e.g. log `process.env.NEXT_PUBLIC_DEMO_MODE === "1"` in a throwaway script).
- Done when the cause of the `/login` self-redirect is named with file:line, and this spec is updated with it. Stop and report if the fix needs anything beyond `proxy.ts`.

### 2. Characterization tests for the proxy
- Zone: 🔴 `proxy.ts` (tests only; ask before starting)
- Blocked by: 1
- Status: todo
- There are no proxy tests. Add `proxy.test.ts` (unit project) covering, for mock mode: unauthenticated dashboard paths in cs and en → login URL; non-dashboard paths → next-intl routing; authenticated → passes through.
- Done when the tests pin current behaviour, including a failing test for the cs loop/extra hop.

### 3. Fix the login redirect
- Zone: 🔴 `proxy.ts` (ask before changing)
- Blocked by: 2
- Status: todo
- Likely fix: build the login URL with next-intl's `getPathname({ href: "/login", locale })` (or add a prefix only for non-default locales), and fix whatever task 1 finds for the self-redirect.
- Done when:
  - task 2 tests pass, with no test weakened
  - `curl` shows at most one redirect for every row in the table above
  - `npm run e2e` passes (outside the sandbox, ask first)
  - Home can be measured and screenshotted in cs at 1440×900 (unblocks `fjall-migration.md` task 6)
