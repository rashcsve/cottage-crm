# AI & Quality Setup Review

Audit of existing AI-agent and quality tooling in this repo, checked against the code as of 2026-09-15. Verdicts: **keep** (correct, no action), **fix** (present but incorrect/stale), **remove** (present but should go), **missing** (target item not present).

## Context files

| item | verdict | reason |
| --- | --- | --- |
| `CLAUDE.md` | keep | Thin wrapper (`@AGENTS.md` import + Claude Code–specific pointers to rules/agents/skills/hooks/settings). Every pointer resolves to a real file (`.claude/rules/*.md`, `.claude/agents/security-reviewer.md`, `.claude/skills/*`, `.claude/hooks/check-artifacts-on-stop.sh`, `.claude/settings.json` + `.claude/settings.local.json`). Accurate. |
| `AGENTS.md` | keep | Comprehensive cross-agent source of truth. Spot-checked against code: feature-slice layout matches `features/visits`, package.json scripts match §9 exactly, Vitest coverage thresholds (75/75/70/75) match `vitest.config.ts`, Playwright config (chromium-only, 1 worker, port 3100, `E2E_MOCKS=1`) matches `playwright.config.ts`, and the `visits` schema-message naming exception is real (`features/visits/schemas/create-visit-schema-messages.ts`). No drift found. |
| `docs/architecture.md` (or similar) | missing | No dedicated architecture doc. AGENTS.md §2–3 covers this narratively, but there's no standalone diagram/reference doc for onboarding. |
| `docs/code-standards.md` | missing | TypeScript/naming/import conventions live in AGENTS.md §5 but aren't broken out into a standalone standards doc. |
| `docs/testing.md` | missing | Testing strategy lives in AGENTS.md §8 only; no dedicated doc covering test-writing guidance beyond what's there. |
| `docs/a11y.md` (accessibility standards) | missing | No accessibility guidance doc anywhere in the repo. The only a11y tooling is the Storybook `@storybook/addon-a11y`, and it's configured in non-blocking mode (`a11y: { test: "todo" }` in `.storybook/preview.tsx`) — violations are surfaced, not enforced. |
| Progress tracker | missing | No `docs/progress.md`, changelog, or task-tracking file. Nothing else in the repo substitutes for it. |

## `.claude/` — settings, hooks, agents, skills, rules

| item | verdict | reason |
| --- | --- | --- |
| `.claude/settings.json` (permissions) | keep | `allow`/`ask`/`deny` lists line up with AGENTS.md §11 "Actions requiring explicit approval": `npm install/uninstall/update`, `git commit/push/merge/rebase`, edits to `package.json`, `supabase/migrations/**`, `.github/workflows/**`, `AGENTS.md`/`CLAUDE.md`, and `.claude/**` all require confirmation (`ask`). `.env*` files are denied for both Read and Edit, matching §10 "Demo and secrets". Sandbox is enabled. Consistent with the doc. |
| `.claude/settings.local.json` | keep | Minimal personal override (`Bash(npx tsc *)` allowed). Harmless, no conflict with project settings. |
| `.claude/hooks/check-artifacts-on-stop.sh` (Stop hook) | keep | Blocks session end if `test-results/agent`, `.agent-artifacts`, `playwright-report`, or `storybook-static` are dirty in git status — matches AGENTS.md §11 "Remove unnecessary artifacts before finishing" and CLAUDE.md's description of it. Logic is correct (handles `stop_hook_active` re-entry, empty status, and non-repo cases safely). |
| `.claude/agents/security-reviewer.md` | keep | Read-only tool set (`Read`, `Glob`, `Grep`), `permissionMode: plan`. Review checklist (RLS drift, `0001_initial_schema.sql` edits, secrets, revalidation gaps, E2E mock bypass) matches AGENTS.md §10 invariants exactly, including the task `requireUser()` exception. |
| `.claude/skills/plan-feature` | keep | Plan steps (Server Component pages → `get*PageData()` → Server Actions → schemas/i18n → E2E mocks → validation commands) match the actual data-flow pattern in AGENTS.md §3. `disable-model-invocation: true` is appropriate for an explicit-ask skill. |
| `.claude/skills/verify-change` | keep | Command sequence (`lint` → `tsc --noEmit` → `test:run` → `build`) matches package.json scripts and AGENTS.md §9/§12 verbatim, in the same order. |
| `.claude/skills/security-review` | keep | Same invariant checklist as the `security-reviewer` subagent; CLAUDE.md explicitly documents this as an intentional duplication ("mirror content already in AGENTS.md"), not drift. |
| `.claude/rules/dashboard-streaming.md` | keep | Matches AGENTS.md §6's documented Server Component/Suspense-streaming exception for `features/dashboard/**` and the overview route. |
| `.claude/rules/e2e-infrastructure.md` | keep | Verified against `playwright.config.ts`: mock mode (`E2E_MOCKS=1`), Chromium-only, 1 worker, port 3100 all match. |
| `.claude/rules/forms-localization.md` | keep | Matches AGENTS.md §4/§7, including the `create-visit-schema-messages.ts` naming exception. |
| `.claude/rules/supabase-security.md` | keep | Matches AGENTS.md §10; correctly states only `/api/weather` and `/api/e2e/reset` exist as API routes (verified — no other routes under `app/api/`). |
| `.claude/rules/visits-calendar-exceptions.md` | keep | Matches AGENTS.md §2's two documented client-state exceptions (browser-history calendar state, optimistic merge) near verbatim. |
| `.claude/commands/` | missing | No custom slash commands defined. Not called for by AGENTS.md, but worth noting since the task scope asked about `.claude/` broadly. |

## MCP

| item | verdict | reason |
| --- | --- | --- |
| `.mcp.json` | missing | No MCP server configuration at the repo root. Notably, `@storybook/addon-mcp` is a devDependency (exposes Storybook over MCP) but nothing in the repo wires an MCP client to it — the dependency is present but unused/unconfigured for agent access. |

## Lint / format / types

| item | verdict | reason |
| --- | --- | --- |
| `eslint.config.mjs` | keep | Flat config extending `eslint-config-next` (`core-web-vitals` + `typescript`), which bundles `jsx-a11y` rules — so baseline accessibility linting exists even without a dedicated a11y doc. Also applies `eslint-plugin-storybook`'s recommended rules and a sensible `no-unused-vars` override (`^_` ignore pattern). No issues found. |
| Prettier | missing | No `.prettierrc*`, `prettier.config.*`, or `prettier` dependency anywhere in `package.json`. Formatting is left entirely to ESLint, which doesn't enforce whitespace/style formatting the way Prettier does. Not necessarily wrong (may be a deliberate choice), but it's undocumented — AGENTS.md doesn't mention a formatting policy either way. |
| `tsconfig.json` | keep | `"strict": true` retained, matches AGENTS.md §5's "do not weaken it." Path alias `@/*` → repo root matches §5's import convention. |

## Test configs

| item | verdict | reason |
| --- | --- | --- |
| `vitest.config.ts` | keep | Coverage thresholds (75% lines/functions/statements, 70% branches) match AGENTS.md §8 exactly. Two-project setup (jsdom + Storybook-in-Chromium via `@vitest/browser-playwright`) matches the documented Storybook testing approach. |
| `playwright.config.ts` | keep | Chromium-only, `workers: 1`, port 3100, mock-mode env vars (`E2E_MOCKS=1`, dummy Supabase URL/key) — all match AGENTS.md §8 / `.claude/rules/e2e-infrastructure.md`. |
| `.storybook/main.ts` + `preview.tsx` | keep (with gap) | Config is coherent (`addon-a11y`, `addon-vitest`, `addon-docs` wired correctly). Gap: `a11y: { test: "todo" }` means accessibility violations are reported but never fail a build — see a11y row below. |

## CI (`.github/workflows/ci.yml`)

| item | verdict | reason |
| --- | --- | --- |
| `checks` job (lint, typecheck, unit tests, build) | keep | Runs `npm run lint`, `npm exec tsc --noEmit`, `npm run test:run`, `npm run build` in that exact order — matches AGENTS.md §9/§12's required validation sequence. |
| `e2e` job (Playwright) | keep | Separate job, installs Chromium, runs `npm run e2e`, uploads the HTML report as an artifact on every run (`if: always()`). Correct and matches the E2E architecture doc. |
| a11y enforcement in CI | missing | Neither CI job runs an accessibility scan (e.g., `@axe-core/playwright` against key pages) or turns the Storybook `addon-a11y` check into a blocking test. Accessibility is checked nowhere in a way that can fail a build. |

## Reviewer subagent

| item | verdict | reason |
| --- | --- | --- |
| Security-scoped reviewer (`security-reviewer` + `security-review` skill) | keep | Covers the target's "a reviewer subagent" ask for the highest-risk surface (Supabase/auth/RLS/secrets), read-only, proactively triggered per CLAUDE.md. |
| General code-quality reviewer subagent | missing | There's no subagent dedicated to general correctness/simplification/reuse review scoped to this repo's conventions (naming, feature-slice structure, Server/Client boundary rules, etc.) — that role is currently only covered ad hoc by the global `code-review`/`simplify` skills, which aren't repo-specific the way `security-reviewer` is. |

## Claude Code hooks

| item | verdict | reason |
| --- | --- | --- |
| Lint-on-edit hook (PostToolUse) | missing | No hook runs `eslint` after Claude edits a file. Linting only happens when a human or the `verify-change` skill explicitly runs `npm run lint`. |
| Typecheck-when-finished hook | missing | Only the Stop hook that checks for uncommitted test artifacts exists. Nothing runs `tsc --noEmit` automatically when a session/task ends. |
| Protect `.env` files | keep (via permissions, not a hook) | Functionally covered: `.claude/settings.json` denies both `Read` and `Edit` on all `.env*` variants and the sandbox filesystem config independently denies read access to the same files. This achieves the protection goal, but it's implemented as a permission rule, not a `PreToolUse` hook — worth knowing if the intent was specifically hook-based enforcement (e.g., to also catch shell commands like `cat .env` routed through `Bash`, which the current deny rules target separately via the sandbox, not via `.claude/settings.json`). |

## Summary of what's missing relative to the target

| item | verdict | reason |
| --- | --- | --- |
| `docs/architecture.md` | missing | See Context files section. |
| `docs/code-standards.md` | missing | See Context files section. |
| `docs/testing.md` | missing | See Context files section. |
| `docs/a11y.md` + enforced a11y checks | missing | No a11y standards doc; Storybook a11y addon is non-blocking; no axe scan in CI/E2E. |
| Progress tracker | missing | No file of this kind exists. |
| Hook: lint on edit | missing | Not configured in `.claude/settings.json`. |
| Hook: typecheck when finished | missing | Not configured; only the artifact-check Stop hook exists. |
| Hook: protect `.env` | present, but as permissions not a hook | Already effectively covered — flagged for awareness only. |
| General-purpose reviewer subagent | missing | Only the security-scoped one exists. |
| CI: typecheck, lint, tests, e2e | present | Already implemented in `.github/workflows/ci.yml`. |
| CI: e2e with axe | missing | No axe-based accessibility assertions anywhere in the Playwright suite or CI. |
