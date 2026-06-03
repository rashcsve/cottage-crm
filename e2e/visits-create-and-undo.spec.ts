import { expect, test } from "playwright/test";

import { resetE2EState, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

/**
 * E2E over unit because these tests cross the full stack boundary:
 * server action → optimistic state update → toast system → DOM visibility.
 * The interesting invariants — item disappears before the server round-trip,
 * undo reverses purely client-side state, and the toast wires up to the right
 * action — cannot be verified by mocking the server action in a unit test.
 */

test("hides a visit immediately when deleted and shows undo toast", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/en/visits?view=agenda");

  await page
    .getByRole("button", { name: "Delete visit for Svetlana and Filip" })
    .click();

  await expect(page.getByText("Svetlana and Filip")).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Visit deleted" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
});

test("restores a visit when undo is clicked before the timer expires", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/en/visits?view=agenda");

  await page
    .getByRole("button", { name: "Delete visit for Svetlana and Filip" })
    .click();

  await expect(page.getByText("Svetlana and Filip")).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();

  await expect(page.getByText("Svetlana and Filip")).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Visit restored" }),
  ).toBeVisible();
});

test("creates a visit, deletes it optimistically, and recovers it with undo", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/en/visits?view=agenda");

  // Open the composer (only visible in agenda view)
  await page.getByRole("button", { name: "New visit" }).click();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 10);
  const tomorrowIso = tomorrow.toISOString().split("T")[0];
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 12);
  const dayAfterIso = dayAfter.toISOString().split("T")[0];

  await page.getByLabel("Who's visiting").fill("Test Guest");
  await page.getByLabel("From").fill(tomorrowIso);
  await page.getByLabel("To").fill(dayAfterIso);
  await page.getByRole("button", { name: "Add visit" }).click();

  await expect(page.getByText("Test Guest")).toBeVisible();

  await page
    .getByRole("button", { name: "Delete visit for Test Guest" })
    .click();

  await expect(page.getByText("Test Guest")).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();

  await expect(page.getByText("Test Guest")).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Visit restored" }),
  ).toBeVisible();
});
