import { describe, expect, it } from "vitest";
import { formatShoppingTimestamp } from "@/features/shopping/shared/formatShoppingDate";

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
