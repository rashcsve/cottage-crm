import { expect, test } from "playwright/test";

import { getSearchParam, resetE2EState, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetE2EState(page);
});

test("navigates between calendar views and periods without losing URL state", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/en/visits");

  const calendarNavigation = page.getByRole("group", {
    name: "Calendar navigation",
  });

  await page.getByRole("button", { name: "Week" }).click();
  await expect(await getSearchParam(page, "view")).toBe("week");

  const initialAnchor = await getSearchParam(page, "date");

  await calendarNavigation.getByRole("button", { name: "Next period" }).click();

  const shiftedAnchor = await getSearchParam(page, "date");
  expect(shiftedAnchor).not.toBe(initialAnchor);

  await calendarNavigation
    .getByRole("button", { name: "Previous period" })
    .click();
  await expect(await getSearchParam(page, "date")).toBe(initialAnchor);

  await calendarNavigation.getByRole("button", { name: "Today" }).click();

  const browserTodayIso = await page.evaluate(() => {
    return new Intl.DateTimeFormat("en-CA").format(new Date());
  });

  await expect(await getSearchParam(page, "date")).toBe(browserTodayIso);
});
