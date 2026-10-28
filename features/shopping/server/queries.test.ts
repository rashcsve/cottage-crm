import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseTableMock } from "@/tests/utils/create-supabase-table-mock";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getShoppingOverview } from "./queries";

function shoppingRow(id: number, isChecked: boolean) {
  return {
    id,
    title: `Item ${id}`,
    is_checked: isChecked,
    author_id: "author-id",
    brought_by_id: null,
    created_at: `2026-04-0${id}T10:00:00.000Z`,
    author: { display_name: "Alice Johnson" },
    brought_by: null,
  };
}

const ROWS = [
  shoppingRow(1, false),
  shoppingRow(2, true),
  shoppingRow(3, false),
  shoppingRow(4, false),
  shoppingRow(5, false),
  shoppingRow(6, true),
];

describe("getShoppingOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("counts purchased items without fetching their rows", async () => {
    const { client, queries } = createSupabaseTableMock({ shopping_items: ROWS });
    createClientMock.mockResolvedValue(client);

    const overview = await getShoppingOverview(3);

    const countQueries = queries.filter((query) =>
      query.calls.some(
        ([method, , options]) =>
          method === "select" &&
          JSON.stringify(options) === JSON.stringify({ count: "exact", head: true }),
      ),
    );
    expect(countQueries).toHaveLength(1);
    expect(countQueries[0]?.table).toBe("shopping_items");
    expect(countQueries[0]?.calls).toEqual(
      expect.arrayContaining([["eq", "is_checked", true]]),
    );
    expect(overview.purchasedCount).toBe(2);
  });

  it("takes the total pending count from the limited preview query", async () => {
    const { client, queries } = createSupabaseTableMock({ shopping_items: ROWS });
    createClientMock.mockResolvedValue(client);

    const overview = await getShoppingOverview(3);

    const previewQuery = queries.find((query) =>
      query.calls.some(([method]) => method === "limit"),
    );
    expect(previewQuery?.calls).toEqual(
      expect.arrayContaining([
        ["select", expect.any(String), { count: "exact" }],
      ]),
    );
    expect(overview.pendingCount).toBe(4);
    expect(overview.pendingItems).toHaveLength(3);
  });

  it("previews only the newest pending items up to the limit", async () => {
    const { client, queries } = createSupabaseTableMock({ shopping_items: ROWS });
    createClientMock.mockResolvedValue(client);

    const overview = await getShoppingOverview(3);

    const previewQuery = queries.find((query) =>
      query.calls.some(([method]) => method === "limit"),
    );
    expect(previewQuery?.table).toBe("shopping_items");
    expect(previewQuery?.calls).toEqual(
      expect.arrayContaining([
        ["eq", "is_checked", false],
        ["order", "created_at", { ascending: false }],
        ["limit", 3],
      ]),
    );
    expect(queries).toHaveLength(2);
    expect(overview.pendingItems.map((item) => item.id)).toEqual([5, 4, 3]);
    expect(overview.pendingItems[0]).toEqual({
      id: 5,
      title: "Item 5",
      isChecked: false,
      author: "Alice Johnson",
      authorId: "author-id",
      broughtBy: null,
      broughtById: null,
      createdAt: "2026-04-05T10:00:00.000Z",
    });
  });

  it("throws when any of the queries fails", async () => {
    const { client } = createSupabaseTableMock(
      { shopping_items: ROWS },
      { shopping_items: { message: "boom" } },
    );
    createClientMock.mockResolvedValue(client);

    await expect(getShoppingOverview(3)).rejects.toThrow(
      "Failed to fetch shopping list",
    );
  });
});
