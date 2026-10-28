import { describe, expect, it, vi } from "vitest";
import {
  formatFullTimestamp,
  formatRelativeTimestamp,
} from "@/lib/utils/formatRelativeTimestamp";

const now = new Date("2026-10-14T12:00:00.000Z");

function ago(ms: number): string {
  return new Date(now.getTime() - ms).toISOString();
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTimestamp", () => {
  it("shows 'now' for less than a minute ago", () => {
    expect(formatRelativeTimestamp(ago(30 * 1000), "en", now)).toBe("now");
    expect(formatRelativeTimestamp(ago(30 * 1000), "cs", now)).toBe("nyní");
  });

  it("shows 'now' for timestamps slightly in the future", () => {
    expect(formatRelativeTimestamp(ago(-5 * MINUTE), "en", now)).toBe("now");
  });

  it("shows minutes for less than an hour ago", () => {
    expect(formatRelativeTimestamp(ago(15 * MINUTE), "en", now)).toBe(
      "15 minutes ago",
    );
    expect(formatRelativeTimestamp(ago(15 * MINUTE), "cs", now)).toBe(
      "před 15 minutami",
    );
  });

  it("shows hours for less than a day ago", () => {
    expect(formatRelativeTimestamp(ago(3 * HOUR), "en", now)).toBe(
      "3 hours ago",
    );
    expect(formatRelativeTimestamp(ago(3 * HOUR), "cs", now)).toBe(
      "před 3 hodinami",
    );
  });

  it("shows 'yesterday' for one day ago", () => {
    expect(formatRelativeTimestamp(ago(DAY + HOUR), "en", now)).toBe(
      "yesterday",
    );
    expect(formatRelativeTimestamp(ago(DAY + HOUR), "cs", now)).toBe("včera");
  });

  it.each([
    ["2026-10-26T22:30:00Z", "2026-10-28T21:00:00Z"],
    // Spring DST makes two Prague calendar days shorter than 48 hours.
    ["2026-03-28T22:30:00Z", "2026-03-30T20:00:00Z"],
    // Both instants are after midnight in Prague, but on the previous UTC date.
    ["2026-10-26T23:30:00Z", "2026-10-28T23:15:00Z"],
  ])("counts Prague calendar days from %s to %s", (value, currentTime) => {
    expect(formatRelativeTimestamp(value, "en", new Date(currentTime))).toBe(
      "2 days ago",
    );
    expect(formatRelativeTimestamp(value, "cs", new Date(currentTime))).toBe(
      "předevčírem",
    );
  });

  it("keeps yesterday across the 25-hour autumn DST day", () => {
    expect(
      formatRelativeTimestamp(
        "2026-10-24T22:15:00Z",
        "en",
        new Date("2026-10-26T00:00:00Z"),
      ),
    ).toBe("yesterday");
  });

  it("uses a full timestamp after seven Prague calendar days", () => {
    const value = "2026-10-21T21:30:00Z";

    expect(
      formatRelativeTimestamp(value, "en", new Date("2026-10-28T20:00:00Z")),
    ).toBe(formatFullTimestamp(value, "en"));
  });

  it("shows days for less than a week ago", () => {
    expect(formatRelativeTimestamp(ago(6 * DAY), "en", now)).toBe(
      "6 days ago",
    );
    expect(formatRelativeTimestamp(ago(6 * DAY), "cs", now)).toBe(
      "před 6 dny",
    );
  });

  it("shows the date and time in Prague time from a week ago", () => {
    const value = ago(7 * DAY);

    expect(formatRelativeTimestamp(value, "cs", now)).toBe("7. 10. 2026 14:00");
    expect(formatRelativeTimestamp(value, "cs", now)).toBe(
      formatFullTimestamp(value, "cs"),
    );
  });

  it("returns the original string when the timestamp is invalid", () => {
    expect(formatRelativeTimestamp("not-a-date", "en", now)).toBe(
      "not-a-date",
    );
  });
});

describe("formatFullTimestamp", () => {
  it("formats the date and time in Prague time", () => {
    expect(formatFullTimestamp("2026-10-14T13:05:00.000Z", "cs")).toBe(
      "14. 10. 2026 15:05",
    );
    expect(formatFullTimestamp("2026-12-14T13:05:00.000Z", "cs")).toBe(
      "14. 12. 2026 14:05",
    );
  });

  it("formats in the cottage time zone regardless of the host", async () => {
    vi.stubEnv("TZ", "America/New_York");
    vi.resetModules();

    try {
      const { formatFullTimestamp: formatFresh } = await import(
        "@/lib/utils/formatRelativeTimestamp"
      );

      expect(formatFresh("2026-04-22T22:30:00.000Z", "en")).toMatch(
        /^Apr 23, 2026, 12:30\sAM$/u,
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("accepts Date values", () => {
    const iso = "2026-10-14T13:05:00.000Z";

    expect(formatFullTimestamp(new Date(iso), "en")).toBe(
      formatFullTimestamp(iso, "en"),
    );
  });

  it("returns the original string when the timestamp is invalid", () => {
    expect(formatFullTimestamp("not-a-date", "en")).toBe("not-a-date");
  });
});
