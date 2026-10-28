import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseTableMock } from "@/tests/utils/create-supabase-table-mock";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getActiveAndUpcomingVisits } from "./queries";

const TODAY = "2026-05-10";
const author = { display_name: "Alice Johnson" };

function visitRow(id: number, dateFrom: string, dateTo: string) {
  return {
    id,
    visitor_name: `Visitor ${id}`,
    date_from: dateFrom,
    date_to: dateTo,
    note: null,
    author_id: "author-id",
    created_at: "2026-04-01T10:00:00.000Z",
    author,
  };
}

describe("getActiveAndUpcomingVisits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("fetches only visits ending today or later, ordered by start date", async () => {
    const { client, queries } = createSupabaseTableMock({
      visits: [
        visitRow(1, "2026-06-01", "2026-06-03"),
        visitRow(2, "2026-05-01", "2026-05-09"),
        visitRow(3, "2026-05-08", "2026-05-10"),
      ],
    });
    createClientMock.mockResolvedValue(client);

    const visits = await getActiveAndUpcomingVisits(TODAY);

    expect(queries).toHaveLength(1);
    expect(queries[0].table).toBe("visits");
    expect(queries[0].calls).toContainEqual(["gte", "date_to", TODAY]);
    expect(queries[0].calls).toContainEqual([
      "order",
      "date_from",
      { ascending: true },
    ]);
    expect(visits.map((visit) => [visit.id, visit.status])).toEqual([
      [3, "current"],
      [1, "upcoming"],
    ]);
  });

  it("throws when the query fails", async () => {
    const { client } = createSupabaseTableMock(
      { visits: [] },
      { visits: { message: "boom" } },
    );
    createClientMock.mockResolvedValue(client);

    await expect(getActiveAndUpcomingVisits(TODAY)).rejects.toThrow(
      "Failed to fetch visits",
    );
  });
});
