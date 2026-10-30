import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_RECENT_NOTES_LIMIT } from "@/features/dashboard/domain/overview";
import { groupNotesByRecency } from "@/features/notes/domain/note-groups";
import { countItemsAddedToday } from "@/features/shopping/domain/added-today";
import { formatPragueDateOnly } from "@/lib/utils/date";
import {
  addE2EMockVisit,
  deleteE2EMockVisit,
  getE2EMockDashboardOverviewData,
  getE2EMockNotes,
  getE2EMockShoppingItems,
  getE2EMockVisits,
  resetE2EMockState,
} from "./mock-data";

describe("E2E mock visits", () => {
  beforeEach(() => {
    resetE2EMockState();
  });

  it("adds a new visit to the front of the list", () => {
    const initialCount = getE2EMockVisits().length;

    const visit = addE2EMockVisit({
      visitorName: "Cottage guests",
      couple: "couple-1",
      dateFrom: "2099-01-10",
      dateTo: "2099-01-12",
      note: null,
      author: "E2E Admin",
    });

    const visits = getE2EMockVisits();
    expect(visits).toHaveLength(initialCount + 1);
    expect(visit.ok).toBe(true);
    expect(visits[0]).toEqual(visit.ok && visit.data);
    expect(visits[0]).toMatchObject({
      visitorName: "Cottage guests",
      couple: "couple-1",
      dateFrom: "2099-01-10",
      dateTo: "2099-01-12",
      status: "upcoming",
    });
  });

  describe("just after midnight in Prague", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-01-14T23:30:00.000Z"));
      resetE2EMockState();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("seeds the current visit around the Prague date", () => {
      const current = getE2EMockVisits().find((visit) => visit.status === "current");

      expect(current).toMatchObject({ dateFrom: "2026-01-14", dateTo: "2026-01-17" });
    });

    it("marks a visit starting on the Prague date as current", () => {
      const result = addE2EMockVisit({
        visitorName: "Cottage guests",
        couple: "couple-1",
        dateFrom: "2026-01-15",
        dateTo: "2026-01-16",
        note: null,
        author: "E2E Admin",
      });

      expect(result.ok && result.data.status).toBe("current");
    });

    it("gives the dashboard the Prague date as today", () => {
      expect(getE2EMockDashboardOverviewData().todayIso).toBe("2026-01-15");
    });
  });

  it("rejects a visit overlapping another visit of the same couple", () => {
    const input = {
      visitorName: "Cottage guests",
      couple: "couple-1" as const,
      dateFrom: "2099-01-10",
      dateTo: "2099-01-12",
      note: null,
      author: "E2E Admin",
    };
    addE2EMockVisit(input);
    const initialCount = getE2EMockVisits().length;

    const result = addE2EMockVisit({ ...input, dateFrom: "2099-01-12", dateTo: "2099-01-14" });

    expect(result).toEqual({ ok: false, error: "conflict" });
    expect(getE2EMockVisits()).toHaveLength(initialCount);
  });

  it("allows overlapping admin visits like the database constraint does", () => {
    const input = {
      visitorName: "Cottage guests",
      couple: "admin" as const,
      dateFrom: "2099-01-10",
      dateTo: "2099-01-12",
      note: null,
      author: "E2E Admin",
    };
    addE2EMockVisit(input);

    const result = addE2EMockVisit({ ...input, dateFrom: "2099-01-11", dateTo: "2099-01-13" });

    expect(result.ok).toBe(true);
  });

  it("allows another couple on the same dates", () => {
    const input = {
      visitorName: "Cottage guests",
      couple: "couple-1" as const,
      dateFrom: "2099-01-10",
      dateTo: "2099-01-12",
      note: null,
      author: "E2E Admin",
    };
    addE2EMockVisit(input);

    expect(addE2EMockVisit({ ...input, couple: "couple-2" }).ok).toBe(true);
  });

  it("deletes a visit and returns it", () => {
    const [first] = getE2EMockVisits();

    expect(deleteE2EMockVisit(first.id)).toEqual(first);
    expect(getE2EMockVisits().some((visit) => visit.id === first.id)).toBe(false);
  });

  it("returns null when deleting an unknown visit", () => {
    expect(deleteE2EMockVisit(999)).toBeNull();
  });
});

describe("getE2EMockNotes", () => {
  it("returns notes newest first", () => {
    const createdAt = getE2EMockNotes().map((note) => note.createdAt);

    expect(createdAt).toEqual([...createdAt].sort().reverse());
  });

  it("includes a note with several viewable photos and one unavailable photo for the lightbox", () => {
    const withPhotos = getE2EMockNotes().find((note) => note.photos.length > 1);

    expect(withPhotos).toBeDefined();
    expect(
      withPhotos?.photos.filter((photo) => photo.url !== null).length
    ).toBeGreaterThanOrEqual(2);
    expect(withPhotos?.photos.some((photo) => photo.url === null)).toBe(true);
  });

  it("inlines every photo as an SVG data URI so it loads without the network or the proxy", () => {
    const urls = getE2EMockNotes()
      .flatMap((note) => note.photos)
      .flatMap((photo) => (photo.url ? [photo.url] : []));

    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith("data:image/svg+xml,")).toBe(true);
    }
  });

  it("feeds the newest notes to the dashboard preview, capped like production", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-30T12:00:00.000Z"));
    try {
      expect(getE2EMockDashboardOverviewData().notes.recentNotes).toEqual(
        getE2EMockNotes().slice(0, DASHBOARD_RECENT_NOTES_LIMIT)
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("seeds notes for both the this-week and the earlier group", () => {
    const groups = groupNotesByRecency(
      getE2EMockNotes(),
      formatPragueDateOnly(new Date())
    );

    expect(groups.thisWeek.length).toBeGreaterThan(0);
    expect(groups.earlier.length).toBeGreaterThan(0);
  });
});

describe("getE2EMockShoppingItems", () => {
  beforeEach(() => {
    resetE2EMockState();
  });

  it("seeds a pending item added today", () => {
    const pending = getE2EMockShoppingItems().filter((item) => !item.isChecked);

    expect(
      countItemsAddedToday(pending, formatPragueDateOnly(new Date()))
    ).toBeGreaterThan(0);
  });
});
