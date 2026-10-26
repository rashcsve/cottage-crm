import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

import { dashboardRoutes } from "@/lib/routes";

const dashboardDir = resolve(process.cwd(), "app/[locale]/(dashboard)");

describe("dashboard catch-all routes", () => {
  it.each(Object.values(dashboardRoutes))(
    "%s has a catch-all so unknown sub-paths keep the app shell",
    (route) => {
      expect(existsSync(resolve(dashboardDir, `.${route}/[...rest]/page.tsx`))).toBe(
        true,
      );
    },
  );

  it.each(Object.values(dashboardRoutes))(
    "%s keeps its loading skeleton out of the catch-all's way",
    (route) => {
      expect(existsSync(resolve(dashboardDir, `.${route}/loading.tsx`))).toBe(
        false,
      );
    },
  );
});
