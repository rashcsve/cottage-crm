import { describe, expect, it } from "vitest";
import {
  formatVisitCompactDate,
  formatVisitCompactDateRangeLabel,
  formatVisitDateRangeLabel,
  formatVisitDayNumber,
  formatVisitFullDate,
  formatVisitMonthLabel,
  formatVisitWeekRangeLabel,
} from "./formatVisitDate";

describe("features/visits/shared/formatVisitDate", () => {
  it("formats full, compact, and day-number labels from the same UTC date-only model", () => {
    const isoDate = "2026-04-10";
    const utcDate = new Date(Date.UTC(2026, 3, 10));

    expect(formatVisitFullDate(isoDate, "en")).toBe(
      formatVisitFullDate(utcDate, "en"),
    );
    expect(formatVisitCompactDate(isoDate, "en")).toBe(
      formatVisitCompactDate(utcDate, "en"),
    );
    expect(formatVisitDayNumber(isoDate, "en")).toBe(
      formatVisitDayNumber(utcDate, "en"),
    );
  });

  it("formats month-year labels consistently across locales", () => {
    expect(formatVisitMonthLabel("2026-04-15", "en")).toBe("April 2026");
    expect(formatVisitMonthLabel("2026-04-15", "cs")).toBe("duben 2026");
  });

  it("uses one shared separator policy for visit date ranges", () => {
    expect(formatVisitDateRangeLabel("2026-04-10", "2026-04-10", "en")).toBe(
      "Apr 10, 2026",
    );
    expect(formatVisitDateRangeLabel("2026-04-10", "2026-04-12", "en")).toBe(
      "Apr 10, 2026 – Apr 12, 2026",
    );
  });

  it("keeps compact visit card ranges short enough to stay visible", () => {
    expect(
      formatVisitCompactDateRangeLabel("2026-04-22", "2026-05-09", "cs"),
    ).toBe("22. 4. – 9. 5.");
    expect(
      formatVisitCompactDateRangeLabel("2026-04-22", "2026-04-22", "cs"),
    ).toBe("22. 4.");
    expect(
      formatVisitCompactDateRangeLabel("2026-12-28", "2027-01-03", "en"),
    ).toBe("12/28/2026 – 1/3/2027");
  });

  it("formats week ranges with locale-safe collapsing and the shared separator", () => {
    expect(formatVisitWeekRangeLabel("2026-04-05", "2026-04-11", "en")).toBe(
      "Apr 5 – 11, 2026",
    );
    expect(formatVisitWeekRangeLabel("2026-04-30", "2026-05-06", "en")).toBe(
      "Apr 30 – May 6, 2026",
    );
    expect(formatVisitWeekRangeLabel("2026-12-28", "2027-01-03", "en")).toBe(
      "Dec 28, 2026 – Jan 3, 2027",
    );
  });

  it("keeps locale-specific week-range formatting while normalizing the separator", () => {
    expect(formatVisitWeekRangeLabel("2026-04-05", "2026-04-11", "cs")).toBe(
      "05.04.2026 – 11.04.2026",
    );
  });
});
