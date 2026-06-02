import { defineConfig, devices } from "playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const HEALTHCHECK_URL = `${BASE_URL}/en/login`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `node scripts/playwright-web-server.mjs ${PORT}`,
    url: HEALTHCHECK_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_MOCKS: "1",
      NEXT_PUBLIC_E2E_MOCKS: "1",
      NEXT_PUBLIC_APP_URL: BASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: "https://e2e.supabase.test",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-anon-key",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
