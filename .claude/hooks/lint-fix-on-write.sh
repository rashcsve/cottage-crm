#!/bin/sh
set -eu

python3 -c '
import json
import os
import subprocess
import sys

payload = json.load(sys.stdin)
tool_input = payload.get("tool_input") or {}
file_path = tool_input.get("file_path")
cwd = payload.get("cwd") or os.getcwd()

if not file_path or not os.path.isfile(file_path):
    raise SystemExit(0)

if "/node_modules/" in file_path:
    raise SystemExit(0)

if not file_path.endswith((".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")):
    raise SystemExit(0)

subprocess.run(
    ["npx", "eslint", "--fix", file_path],
    cwd=cwd,
    capture_output=True,
    text=True,
    check=False,
)

prettier_bin = os.path.join(cwd, "node_modules", ".bin", "prettier")
if os.path.isfile(prettier_bin):
    subprocess.run(
        [prettier_bin, "--write", file_path],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )

raise SystemExit(0)
'
