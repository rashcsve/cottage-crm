import { expect, test } from "playwright/test";

import { resetE2EState, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

test("shows the English 404 page for unknown /en paths", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back home" })).toHaveAttribute(
    "href",
    "/en",
  );
});

test("shows the Czech 404 page for unknown unprefixed paths", async ({
  page,
}) => {
  const response = await page.goto("/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Stránka nebyla nalezena" }),
  ).toBeVisible();
});

test("keeps the app shell for unknown dashboard sub-paths", async ({
  page,
}) => {
  await signIn(page);

  const response = await page.goto("/en/visits/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Page not found | Chata CRM");
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Home" }),
  ).toHaveAttribute("href", "/en/overview");
});
