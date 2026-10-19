#!/bin/sh
set -eu

# Codex PostToolUse hook for apply_patch: run eslint --fix on every JS/TS file the
# patch added or updated. Mirrors .claude/hooks/lint-fix-on-write.sh.
python3 -c '
import json
import os
import re
import subprocess
import sys

payload = json.load(sys.stdin)
cwd = payload.get("cwd") or os.getcwd()

root = subprocess.run(
    ["git", "rev-parse", "--show-toplevel"],
    cwd=cwd,
    capture_output=True,
    text=True,
    check=False,
).stdout.strip() or cwd

def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)

pattern = re.compile(r"^\*\*\* (?:Add File|Update File|Move to): (.+)$", re.MULTILINE)
paths = set()
for text in strings(payload.get("tool_input")):
    for match in pattern.finditer(text):
        path = match.group(1).strip()
        paths.add(path if os.path.isabs(path) else os.path.join(cwd, path))

files = [
    p for p in sorted(paths)
    if os.path.isfile(p)
    and "/node_modules/" not in p
    and p.endswith((".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"))
]

if files:
    subprocess.run(
        ["npx", "eslint", "--fix", *files],
        cwd=root,
        capture_output=True,
        text=True,
        check=False,
    )

raise SystemExit(0)
'
