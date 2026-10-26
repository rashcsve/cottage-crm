import { existsSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";

const port = process.argv[2] ?? "3100";
const lockFilePath = resolve(".next/dev/lock");
const shell = process.platform === "win32";

if (existsSync(lockFilePath)) {
  rmSync(lockFilePath, { force: true });
}

if (process.env.CI) {
  const build = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell,
    env: process.env,
  });

  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const child = spawn(
  "npm",
  [
    "run",
    process.env.CI ? "start" : "dev",
    "--",
    "--hostname",
    "localhost",
    "--port",
    port,
  ],
  {
    stdio: "inherit",
    shell,
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
