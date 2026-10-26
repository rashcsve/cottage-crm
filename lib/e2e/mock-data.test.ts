import { describe, expect, it } from "vitest";
import { DASHBOARD_RECENT_NOTES_LIMIT } from "@/features/dashboard/domain/overview";
import { getE2EMockDashboardOverviewData, getE2EMockNotes } from "./mock-data";

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
    expect(getE2EMockDashboardOverviewData().notes.recentNotes).toEqual(
      getE2EMockNotes().slice(0, DASHBOARD_RECENT_NOTES_LIMIT)
    );
  });
});
