#!/bin/sh
set -eu

python3 -c '
import json
import subprocess
import sys

payload = json.load(sys.stdin)

if payload.get("stop_hook_active"):
    print("{}")
    raise SystemExit(0)

result = subprocess.run(
    [
        "git",
        "status",
        "--porcelain",
        "--",
        "test-results/agent",
        ".agent-artifacts",
        "playwright-report",
        "storybook-static",
    ],
    capture_output=True,
    text=True,
    check=False,
)

if result.returncode != 0:
    print("{}")
    raise SystemExit(0)

lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]

if not lines:
    print("{}")
    raise SystemExit(0)

paths = []
for line in lines:
    if len(line) > 3:
        paths.append(line[3:])
    else:
        paths.append(line)

reason = (
    "Remove or unstage temporary verification artifacts before stopping: "
    + ", ".join(paths)
)

print(json.dumps({"decision": "block", "reason": reason}))
'
