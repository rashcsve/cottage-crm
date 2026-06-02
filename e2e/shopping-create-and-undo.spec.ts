import { expect, test } from "playwright/test";

import { resetE2EState, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

test("creates a shopping item and restores it with undo", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/shopping");

  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Item name").fill("Tea lights");
  await page.getByRole("button", { name: "Add item" }).click();

  await expect(page.getByText("Tea lights")).toBeVisible();

  await page
    .getByRole("button", { name: "Delete item Tea lights" })
    .click();

  await expect(page.getByText("Tea lights")).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Item deleted" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();

  await expect(page.getByText("Tea lights")).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Item restored" }),
  ).toBeVisible();
});
