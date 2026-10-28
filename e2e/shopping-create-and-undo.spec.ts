import { expect, test } from "playwright/test";

import { resetE2EState, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

test("creates a shopping item and restores it with undo", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/shopping");

  await page.getByLabel("New item").fill("Tea lights");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(page.getByText("Tea lights", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "Delete item Tea lights" })
    .click();

  await expect(page.getByText("Tea lights", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Item deleted" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();

  await expect(page.getByText("Tea lights", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Item restored" }),
  ).toBeVisible();
});
