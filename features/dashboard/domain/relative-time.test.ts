import { describe, expect, it } from "vitest";

import { formatRelativeTimestamp } from "@/features/dashboard/domain/relative-time";

const NOW = new Date("2026-10-26T15:00:00Z");

describe("formatRelativeTimestamp", () => {
  it.each([
    ["en", "2026-10-26T14:59:40Z", "now"],
    ["en", "2026-10-26T14:35:00Z", "25 min. ago"],
    ["en", "2026-10-26T13:00:00Z", "2 hr. ago"],
    ["en", "2026-10-25T10:00:00Z", "yesterday"],
    ["en", "2026-10-23T15:00:00Z", "3 days ago"],
    ["cs", "2026-10-26T13:00:00Z", "před 2 h"],
    ["cs", "2026-10-23T15:00:00Z", "před 3 dny"],
  ])("formats recent %s timestamps relatively: %s", (locale, value, expected) => {
    expect(formatRelativeTimestamp(value, NOW, locale)).toBe(expected);
  });

  it.each([
    ["en", "2026-10-19T15:00:00Z", "Oct 19"],
    ["cs", "2026-10-19T15:00:00Z", "19. 10."],
  ])("switches to a short date at 7 days for %s", (locale, value, expected) => {
    expect(formatRelativeTimestamp(value, NOW, locale)).toBe(expected);
  });

  it("adds the year to dates from another year", () => {
    expect(formatRelativeTimestamp("2025-12-30T10:00:00Z", NOW, "en")).toBe(
      "Dec 30, 2025",
    );
  });

  it("treats timestamps slightly in the future as now", () => {
    expect(formatRelativeTimestamp("2026-10-26T15:02:00Z", NOW, "en")).toBe("now");
  });

  it("returns invalid input unchanged", () => {
    expect(formatRelativeTimestamp("not-a-date", NOW, "en")).toBe("not-a-date");
  });
});
