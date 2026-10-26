# Progress Tracker

Living notes on where the project stands. Update this alongside feature work; it is not auto-generated and can go stale — cross-check against `git log` before trusting old entries.

## Status

- 2026-09-15: Added missing accessibility guidance (`AGENTS.md` §13, `.claude/rules/accessibility.md`) and this tracker. See `docs/config-review.md` for the audit that first flagged both as missing.

- 2026-10-19: AI repo setup per `AI-REPO-SETUP.md`: `typecheck` script, Vitest `unit` project name, zones/workflow quick reference in `AGENTS.md`, `/spec` `/next-task` `/review` skills + `reviewer` subagent (replacing `plan-feature`), tightened permissions, `docs/specs/`. Removed the stale `docs/config-review.md`.

- 2026-10-19: Trimmed `AGENTS.md` from 578 to 81 lines using the `AI-REPO-SETUP.md` template (Commands / Conventions / Examples / Gotchas / Zones / Security / Accessibility / Workflow). Dropped content readable from code; replaced `§N` references with section names.

- 2026-10-19: Codex support. Skills moved to shared `.agents/skills/` (`.claude/skills` is now a symlink); `review` renamed `review-spec`; Codex manual-only via `agents/openai.yaml`. Added `.codex/config.toml` (on-request approvals, workspace permission profile denying `.env*` reads, network off, hooks mirroring Claude's), `.codex/rules/default.rules`, `.codex/hooks/lint-fix-on-patch.sh`. `git add` moved to ask in `.claude/settings.json`. `.agents/`, `.claude/`, `.codex/` added to red zone.

- 2026-10-26: Fjäll design-system migration tasks 0–12 done and verified (unit, E2E); dark mode (task 13) skipped. Migration spec and plan removed. Legacy token aliases, `nav-*` tokens and `--font-display` removed; `StatCard`, `PageSection`, `StatusBadge`, `FormSurface` and `visit-status-tone.ts` deleted. The calendar draft-range band is the `range-band` utility. `tests/design-tokens.test.ts` guards against raw palette classes, `focus-visible:outline-none`, `text-[Npx]`, `shadow-*` and legacy tokens.

## Next steps

- Fjäll task 13: dark mode.
- Fjäll cs/en screenshots still pending for tasks 7–10c.

## Decisions

- `AGENTS.md` is no longer self-contained: it keeps one line per rule, and Claude Code gets path-specific detail from `.claude/rules/*.md`. Other agents (Codex etc.) get the short version only — accepted to keep the always-loaded context small.
- Codex rules have no `allow` entries: in Codex, `allow` runs a command outside the sandbox. Tests/lint/typecheck run inside it without prompting anyway.
- Codex Stop hooks reuse `.claude/hooks/*.sh` (same JSON/exit-2 contract); only the post-edit hook is Codex-specific, because `apply_patch` reports a patch, not a file path.
- Cross-references to `AGENTS.md` use section names, not `§N` numbers.
- `jsx-a11y` (ESLint) and Storybook's `addon-a11y` already exist in the repo but only warn (`test: "todo"`); documenting the WCAG 2.1 AA bar as the standard doesn't change that enforcement — it's a separate follow-up if the team wants it blocking.
