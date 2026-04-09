import { describe, expect, it } from "vitest";
import { mapVisitRowToVisit } from "./mappers";

function createVisitRow(
  overrides: Partial<Parameters<typeof mapVisitRowToVisit>[0]> = {}
) {
  return {
    id: 1,
    visitor_name: "Svetlana",
    date_from: "2026-04-10",
    date_to: "2026-04-12",
    note: null,
    author: "Alice Johnson",
    author_id: "admin-user-id",
    created_at: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("mapVisitRowToVisit", () => {
  it("maps snake_case DB rows and derives status from provided today", () => {
    expect(mapVisitRowToVisit(createVisitRow(), "2026-04-11")).toEqual({
      id: 1,
      visitorName: "Svetlana",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
      status: "current",
      note: null,
      author: "Alice Johnson",
      authorId: "admin-user-id",
      createdAt: "2026-04-01T10:00:00.000Z",
    });
  });

  it("remains deterministic for the same provided today", () => {
    const row = createVisitRow({
      date_from: "2026-04-15",
      date_to: "2026-04-16",
    });

    expect(mapVisitRowToVisit(row, "2026-04-10")).toEqual(
      mapVisitRowToVisit(row, "2026-04-10")
    );
    expect(mapVisitRowToVisit(row, "2026-04-10").status).toBe("upcoming");
    expect(mapVisitRowToVisit(row, "2026-04-17").status).toBe("past");
  });
});
