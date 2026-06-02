import { existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const port = process.argv[2] ?? "3100";
const lockFilePath = resolve(".next/dev/lock");

if (existsSync(lockFilePath)) {
  rmSync(lockFilePath, { force: true });
}

const child = spawn(
  "npm",
  ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", port],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
