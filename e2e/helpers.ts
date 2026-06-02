import type { Page } from "playwright/test";
import { expect } from "playwright/test";

export async function resetE2EState(page: Page) {
  const response = await page.request.post("/api/e2e/reset");

  expect(response.ok()).toBeTruthy();
}

export async function signIn(page: Page) {
  await page.goto("/en/login");
  await page.getByLabel("Email").fill("admin@cottage-crm.test");
  await page.getByLabel("Password").fill("super-secret-password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/en\/overview$/, { timeout: 15_000 });
}

export async function getSearchParam(page: Page, key: string) {
  return page.evaluate((searchParamKey) => {
    return new URLSearchParams(window.location.search).get(searchParamKey);
  }, key);
}
