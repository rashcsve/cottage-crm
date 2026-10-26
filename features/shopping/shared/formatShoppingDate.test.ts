import { describe, expect, it } from "vitest";
import {
  formatShoppingShortDate,
  formatShoppingTimestamp,
} from "@/features/shopping/shared/formatShoppingDate";

describe("formatShoppingTimestamp", () => {
  it("formats timestamps with the provided locale", () => {
    const isoDate = "2026-04-01T10:30:00.000Z";
    const utcDate = new Date(Date.UTC(2026, 3, 1, 10, 30, 0));

    expect(formatShoppingTimestamp(isoDate, "en")).toBe(
      formatShoppingTimestamp(utcDate, "en"),
    );
  });

  it("returns the original string when the timestamp is invalid", () => {
    expect(formatShoppingTimestamp("not-a-date", "en-US")).toBe("not-a-date");
  });
});

describe("formatShoppingShortDate", () => {
  const now = new Date(2026, 9, 26, 12, 0, 0);

  it("shows only day and month for a date in the current year", () => {
    expect(formatShoppingShortDate(new Date(2026, 7, 10, 14, 22), "cs", now)).toBe(
      "10. 8.",
    );
    expect(formatShoppingShortDate(new Date(2026, 7, 10, 14, 22), "en", now)).toBe(
      "8/10",
    );
  });

  it("adds the year for a date in another year", () => {
    expect(formatShoppingShortDate(new Date(2025, 7, 10, 14, 22), "cs", now)).toBe(
      "10. 8. 2025",
    );
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatShoppingShortDate("not-a-date", "cs", now)).toBe("not-a-date");
  });
});
