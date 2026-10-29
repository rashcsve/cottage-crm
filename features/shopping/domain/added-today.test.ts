import { describe, expect, it } from "vitest";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import { countItemsAddedToday, getShoppingTodayIso } from "./added-today";

function item(id: number, createdAt: string): ShoppingItem {
  return {
    id,
    title: `Item ${id}`,
    isChecked: false,
    author: "Alice",
    authorId: "alice-id",
    broughtBy: null,
    broughtById: null,
    createdAt,
  };
}

describe("getShoppingTodayIso", () => {
  it("returns the Prague calendar date", () => {
    expect(getShoppingTodayIso(new Date("2026-10-29T10:00:00.000Z"))).toBe(
      "2026-10-29",
    );
  });

  it("is already the next day in Prague shortly before UTC midnight", () => {
    expect(getShoppingTodayIso(new Date("2026-10-28T23:30:00.000Z"))).toBe(
      "2026-10-29",
    );
  });

  it("keeps the Prague date right on both sides of the autumn clock change", () => {
    expect(getShoppingTodayIso(new Date("2026-10-24T22:30:00.000Z"))).toBe(
      "2026-10-25",
    );
    expect(getShoppingTodayIso(new Date("2026-10-25T22:30:00.000Z"))).toBe(
      "2026-10-25",
    );
  });
});

describe("countItemsAddedToday", () => {
  it("counts only items created on the given Prague day", () => {
    const items = [
      item(1, "2026-10-29T08:00:00.000Z"),
      item(2, "2026-10-28T12:00:00.000Z"),
      item(3, "2026-10-29T21:00:00.000Z"),
    ];

    expect(countItemsAddedToday(items, "2026-10-29")).toBe(2);
  });

  it("uses the Prague day, not the UTC day, for items created around midnight", () => {
    const items = [
      item(1, "2026-10-28T23:30:00.000Z"),
      item(2, "2026-10-29T23:30:00.000Z"),
    ];

    expect(countItemsAddedToday(items, "2026-10-29")).toBe(1);
  });

  it("returns 0 for an empty list", () => {
    expect(countItemsAddedToday([], "2026-10-29")).toBe(0);
  });

  it("ignores items with an unparseable timestamp", () => {
    expect(countItemsAddedToday([item(1, "not-a-date")], "2026-10-29")).toBe(0);
  });
});
