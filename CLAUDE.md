@AGENTS.md

## Claude Code specifics

- `.claude/rules/*.md` auto-load additional detail when you touch matching paths (visits calendar exceptions, dashboard streaming, Supabase/auth security, forms/localization, E2E infrastructure). They mirror content already in `AGENTS.md` — if you're seeing a rule fire, `AGENTS.md` has the full cross-agent version of the same guidance.
- `.claude/agents/security-reviewer.md` is a read-only subagent for Supabase/auth/RLS/secrets review — use it proactively for changes under `supabase/`, `lib/auth/`, `lib/supabase/`, or feature server code.
- `.claude/skills/` has `plan-feature`, `verify-change`, and `security-review` — optional conveniences over the workflow and validation steps in `AGENTS.md`, not a replacement for them.
- A `Stop` hook (`.claude/hooks/check-artifacts-on-stop.sh`) blocks ending a session if temporary verification artifacts (`test-results/agent`, `.agent-artifacts`, etc.) are left uncommitted — clean those up before finishing.
- Permission rules enforcing `AGENTS.md`'s approval gates live in `.claude/settings.json` (project) and `.claude/settings.local.json` (personal overrides).
- To verify which instruction files are actually loaded in a session, check the session's initial system context for "Contents of .../CLAUDE.md" and "Contents of .../AGENTS.md" blocks — the harness echoes resolved file contents there.
