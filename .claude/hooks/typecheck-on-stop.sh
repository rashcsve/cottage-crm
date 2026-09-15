#!/bin/sh
set -eu

python3 -c '
import json
import os
import subprocess
import sys

payload = json.load(sys.stdin)
cwd = payload.get("cwd") or os.getcwd()

if payload.get("stop_hook_active"):
    raise SystemExit(0)

result = subprocess.run(
    ["npm", "exec", "tsc", "--noEmit"],
    cwd=cwd,
    capture_output=True,
    text=True,
    check=False,
)

if result.returncode == 0:
    raise SystemExit(0)

output = (result.stdout + result.stderr).strip()
sys.stderr.write("Type-check failed. Fix these errors before stopping:\n\n")
sys.stderr.write(output + "\n")
raise SystemExit(2)
'
