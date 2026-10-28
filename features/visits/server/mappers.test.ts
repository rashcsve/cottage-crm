import { describe, expect, it } from "vitest";
import {
  mapCoupleRowToCouple,
  mapProfileRowToCouple,
  mapVisitRowToVisit,
} from "./mappers";

function createVisitRow(
  overrides: Partial<Parameters<typeof mapVisitRowToVisit>[0]> = {}
) {
  return {
    id: 1,
    visitor_name: "Svetlana",
    couple: "couple-1",
    couple_details: { label: "Jana a Tomáš" },
    date_from: "2026-04-10",
    date_to: "2026-04-12",
    note: null,
    author: { display_name: "Alice Johnson" },
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
      couple: "couple-1",
      coupleLabel: "Jana a Tomáš",
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

  it("rejects a row with an unknown couple", () => {
    expect(() =>
      mapVisitRowToVisit(createVisitRow({ couple: "strangers" }), "2026-04-10")
    ).toThrow();
  });

  it("keeps a visit created before couples existed, with no couple", () => {
    expect(
      mapVisitRowToVisit(createVisitRow({ couple: null }), "2026-04-10").couple
    ).toBeNull();
  });

  it("trims the couple label so it matches the couples list", () => {
    expect(
      mapVisitRowToVisit(
        createVisitRow({ couple_details: { label: " Jana a Tomáš " } }),
        "2026-04-10"
      ).coupleLabel
    ).toBe("Jana a Tomáš");
  });
});

describe("mapCoupleRowToCouple", () => {
  it("maps a couple row", () => {
    expect(mapCoupleRowToCouple({ id: "couple-2", label: "Eva a Karel" })).toEqual({
      id: "couple-2",
      label: "Eva a Karel",
    });
  });

  it.each([
    ["an unknown id", { id: "strangers", label: "Eva a Karel" }],
    ["a blank label", { id: "couple-2", label: "  " }],
    ["a missing label", { id: "couple-2" }],
  ])("returns null for a row with %s", (_case, row) => {
    expect(mapCoupleRowToCouple(row)).toBeNull();
  });
});

describe("mapProfileRowToCouple", () => {
  it("returns the couple of a profile", () => {
    expect(mapProfileRowToCouple({ id: "user-1", couple: "couple-2" })).toBe(
      "couple-2"
    );
  });

  it.each([
    ["no couple", { id: "user-1", couple: null }],
    ["an unknown couple", { id: "user-1", couple: "couple-9" }],
  ])("returns null for a profile with %s", (_case, row) => {
    expect(mapProfileRowToCouple(row)).toBeNull();
  });
});
