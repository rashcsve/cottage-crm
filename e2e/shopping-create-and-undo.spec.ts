import { expect, test } from "playwright/test";

import { resetE2EState, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

test("creates a shopping item and restores it with undo", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/shopping");

  const input = page.getByRole("textbox", { name: "New item" });
  await expect(async () => {
    await input.fill("Tea lights");
    await expect(input).toHaveValue("Tea lights", { timeout: 500 });
  }).toPass();
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
