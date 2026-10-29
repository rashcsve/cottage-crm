import { describe, expect, it } from "vitest";
import {
  formatVisitCompactDate,
  formatVisitCompactDateRangeLabel,
  formatVisitDateRangeLabel,
  formatVisitDayNumber,
  formatVisitFullDate,
  formatVisitMonthLabel,
  formatVisitWeekCardDateRangeLabel,
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

  it("formats week card ranges without spaces so they fit one line", () => {
    expect(
      formatVisitWeekCardDateRangeLabel("2026-10-30", "2026-11-01", "cs"),
    ).toBe("30.10.–1.11.");
    expect(
      formatVisitWeekCardDateRangeLabel("2026-11-01", "2026-11-01", "cs"),
    ).toBe("1.11.");
    expect(
      formatVisitWeekCardDateRangeLabel("2026-12-28", "2027-01-03", "cs"),
    ).toBe("28.12.2026–3.1.2027");
    expect(
      formatVisitWeekCardDateRangeLabel("2026-10-30", "2026-11-01", "en"),
    ).toBe("10/30–11/1");
    expect(
      formatVisitWeekCardDateRangeLabel("2026-11-01", "2026-11-01", "en"),
    ).toBe("11/1");
    expect(
      formatVisitWeekCardDateRangeLabel("2026-12-28", "2027-01-03", "en"),
    ).toBe("12/28/2026–1/3/2027");
  });

  it("shows the year once at the end for compact Czech same-month ranges", () => {
    expect(
      formatVisitCompactDateRangeLabel("2026-11-07", "2026-11-08", "cs"),
    ).toBe("7. 11. – 8. 11. 2026");
    expect(
      formatVisitCompactDateRangeLabel("2026-10-05", "2026-10-08", "cs-CZ"),
    ).toBe("5. 10. – 8. 10. 2026");
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

  it.each([
    ["2026-04-05", "2026-04-11", "cs", "5.–11. 4. 2026"],
    ["2026-04-30", "2026-05-06", "cs", "30. 4. – 6. 5. 2026"],
    ["2026-12-28", "2027-01-03", "cs", "28. 12. 2026 – 3. 1. 2027"],
    ["2026-04-05", "2026-04-11", "en", "Apr 5–11, 2026"],
    ["2026-04-30", "2026-05-06", "en", "Apr 30–May 6, 2026"],
    ["2026-12-28", "2027-01-03", "en", "Dec 28, 2026–Jan 3, 2027"],
  ])("formats the mobile week %s to %s in %s", (start, end, locale, expected) => {
    expect(formatVisitWeekRangeLabel(start, end, locale, "mobile")).toBe(expected);
  });
});
