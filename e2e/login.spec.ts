import { expect, test } from "playwright/test";

import { resetE2EState } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

test("signs in through the public login flow", async ({ page }) => {
  await page.goto("/en/login");

  await page.getByLabel("Email").fill("admin@cottage-crm.test");
  await page.getByLabel("Password").fill("super-secret-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/en\/overview$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
});
