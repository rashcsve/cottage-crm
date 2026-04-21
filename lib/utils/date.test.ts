import { describe, it, expect } from "vitest";
import {
  addDaysUtc,
  compareDateOnly,
  diffDateOnlyInDays,
  formatDateOnlyUtc,
  isDateOnlyString,
  toDateOnlyString,
  isDateOnlyBefore,
  isSameDateOnly,
  formatDateOnly,
  parseDateOnlyUtc,
} from "@/lib/utils/date";

describe("lib/utils/date", () => {
  describe("toDateOnlyString", () => {
    it("converts a Date to YYYY-MM-DD string", () => {
      const date = new Date("2024-01-15T10:30:45Z");
      expect(toDateOnlyString(date)).toBe("2024-01-15");
    });

    it("pads month and day with leading zeros", () => {
      const date = new Date("2024-01-05T00:00:00Z");
      expect(toDateOnlyString(date)).toBe("2024-01-05");
    });

    it("handles leap year dates", () => {
      const date = new Date("2024-02-29T00:00:00Z");
      expect(toDateOnlyString(date)).toBe("2024-02-29");
    });

    it("ignores time component", () => {
      const date1 = new Date("2024-01-15T00:00:00Z");
      const date2 = new Date("2024-01-15T23:59:59Z");
      expect(toDateOnlyString(date1)).toBe(toDateOnlyString(date2));
    });

    it("respects UTC time (not local)", () => {
      const date = new Date("2024-01-15T23:00:00Z");
      expect(toDateOnlyString(date)).toBe("2024-01-15");
    });
  });

  describe("isDateOnlyBefore", () => {
    it("returns true if date-only string is before reference date", () => {
      const reference = new Date("2024-01-15T00:00:00Z");
      expect(isDateOnlyBefore("2024-01-14", reference)).toBe(true);
    });

    it("returns false if date-only string equals reference date", () => {
      const reference = new Date("2024-01-15T00:00:00Z");
      expect(isDateOnlyBefore("2024-01-15", reference)).toBe(false);
    });

    it("returns false if date-only string is after reference date", () => {
      const reference = new Date("2024-01-15T00:00:00Z");
      expect(isDateOnlyBefore("2024-01-16", reference)).toBe(false);
    });

    it("ignores time component of reference date", () => {
      const referenceEarlyHour = new Date("2024-01-15T01:00:00Z");
      const referenceLateHour = new Date("2024-01-15T23:00:00Z");

      expect(isDateOnlyBefore("2024-01-14", referenceEarlyHour)).toBe(true);
      expect(isDateOnlyBefore("2024-01-14", referenceLateHour)).toBe(true);
    });

    it("uses string comparison (lexicographic)", () => {
      const reference = new Date("2024-01-15T00:00:00Z");

      // String comparison: "2024-01-13" < "2024-01-15" lexicographically
      expect(isDateOnlyBefore("2024-01-13", reference)).toBe(true);

      // String comparison: "2024-02-14" > "2024-01-15" lexicographically
      expect(isDateOnlyBefore("2024-02-14", reference)).toBe(false);
    });

    it("handles year boundaries", () => {
      const reference = new Date("2024-01-01T00:00:00Z");

      expect(isDateOnlyBefore("2023-12-31", reference)).toBe(true);
      expect(isDateOnlyBefore("2024-01-01", reference)).toBe(false);
      expect(isDateOnlyBefore("2024-01-02", reference)).toBe(false);
    });

    it("handles leap year dates", () => {
      const reference = new Date("2024-02-29T00:00:00Z");

      expect(isDateOnlyBefore("2024-02-28", reference)).toBe(true);
      expect(isDateOnlyBefore("2024-02-29", reference)).toBe(false);
    });
  });

  describe("isSameDateOnly", () => {
    it("returns true if date-only string matches reference date", () => {
      const reference = new Date("2024-01-15T00:00:00Z");
      expect(isSameDateOnly("2024-01-15", reference)).toBe(true);
    });

    it("returns false if dates do not match", () => {
      const reference = new Date("2024-01-15T00:00:00Z");
      expect(isSameDateOnly("2024-01-14", reference)).toBe(false);
      expect(isSameDateOnly("2024-01-16", reference)).toBe(false);
    });

    it("ignores time component of reference date", () => {
      const referenceEarlyHour = new Date("2024-01-15T01:30:00Z");
      const referenceLateHour = new Date("2024-01-15T23:45:00Z");

      expect(isSameDateOnly("2024-01-15", referenceEarlyHour)).toBe(true);
      expect(isSameDateOnly("2024-01-15", referenceLateHour)).toBe(true);
    });

    it("handles leap year dates", () => {
      const reference = new Date("2024-02-29T00:00:00Z");
      expect(isSameDateOnly("2024-02-29", reference)).toBe(true);
      expect(isSameDateOnly("2024-02-28", reference)).toBe(false);
    });

    it("handles year boundaries", () => {
      const reference = new Date("2024-01-01T00:00:00Z");
      expect(isSameDateOnly("2024-01-01", reference)).toBe(true);
      expect(isSameDateOnly("2023-12-31", reference)).toBe(false);
    });

    it("handles single-digit month and day", () => {
      const reference = new Date("2024-01-05T00:00:00Z");
      expect(isSameDateOnly("2024-01-05", reference)).toBe(true);
    });
  });

  describe("formatDateOnly", () => {
    it("formats date-only string with default pattern (d.M)", () => {
      const formatted = formatDateOnly("2024-01-15", "en");
      // In en-US with pattern "d.M", this should be "15.1"
      expect(formatted).toBe("15.1");
    });

    it("formats with custom pattern", () => {
      // Using a different pattern
      const formatted = formatDateOnly("2024-01-15", "en", "MM/dd/yyyy");
      expect(formatted).toBe("01/15/2024");
    });

    it("respects locale (en-US)", () => {
      const formatted = formatDateOnly("2024-01-15", "en", "MMMM d, yyyy");
      expect(formatted).toBe("January 15, 2024");
    });

    it("respects locale (cs)", () => {
      const formatted = formatDateOnly("2024-01-15", "cs", "d. MMMM yyyy");
      // Czech locale formats dates differently
      // Just verify it contains the day and year
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });

    it("handles single-digit month and day", () => {
      const formatted = formatDateOnly("2024-01-05", "en", "d.M");
      expect(formatted).toBe("5.1");
    });

    it("handles leap year dates", () => {
      const formatted = formatDateOnly("2024-02-29", "en", "d.M");
      expect(formatted).toBe("29.2");
    });

    it("defaults to en-US for unknown locale", () => {
      const formatted = formatDateOnly("2024-01-15", "unknown-locale", "d.M");
      expect(formatted).toBe("15.1");
    });

    it("parses date-only string safely (no timezone shift)", () => {
      // The key is that "2024-01-15" always formats the same way
      // regardless of system timezone
      const formatted1 = formatDateOnly("2024-01-15", "en", "d.M");
      const formatted2 = formatDateOnly("2024-01-15", "en", "d.M");
      expect(formatted1).toBe(formatted2);
      expect(formatted1).toBe("15.1");
    });

    it("handles end-of-month dates", () => {
      const formatted = formatDateOnly("2024-01-31", "en", "dd/MM/yyyy");
      expect(formatted).toBe("31/01/2024");
    });
  });

  describe("UTC date-only helpers", () => {
    it("validates date-only strings", () => {
      expect(isDateOnlyString("2024-01-15")).toBe(true);
      expect(isDateOnlyString("2024/01/15")).toBe(false);
    });

    it("parses and formats UTC date-only values without drift", () => {
      const parsed = parseDateOnlyUtc("2024-01-15");

      expect(parsed.toISOString()).toBe("2024-01-15T00:00:00.000Z");
      expect(formatDateOnlyUtc(parsed)).toBe("2024-01-15");
    });

    it("adds UTC days and compares date-only strings deterministically", () => {
      const shifted = addDaysUtc(parseDateOnlyUtc("2024-01-15"), 3);

      expect(formatDateOnlyUtc(shifted)).toBe("2024-01-18");
      expect(compareDateOnly("2024-01-18", "2024-01-15")).toBeGreaterThan(0);
      expect(diffDateOnlyInDays("2024-01-15", "2024-01-18")).toBe(3);
    });
  });

  describe("integration: date-only workflow", () => {
    it("compares two dates using date-only strings", () => {
      const date1 = new Date("2024-01-10T15:30:00Z");
      const date2 = new Date("2024-01-20T08:45:00Z");

      const str1 = toDateOnlyString(date1);
      const str2 = toDateOnlyString(date2);

      expect(isDateOnlyBefore(str1, date2)).toBe(true);
      expect(isDateOnlyBefore(str2, date1)).toBe(false);
    });

    it("formats and compares task due dates safely", () => {
      // Simulate storing a task due date
      const taskDueDate = "2024-03-15";
      const today = new Date("2024-03-15T23:59:59Z");

      // Check if same day
      expect(isSameDateOnly(taskDueDate, today)).toBe(true);

      // Format for display
      const displayDate = formatDateOnly(taskDueDate, "en", "d.M");
      expect(displayDate).toBe("15.3");
    });

    it("handles overdue check correctly", () => {
      const overdueDate = "2024-01-01";
      const reference = new Date("2024-12-31T00:00:00Z");

      expect(isDateOnlyBefore(overdueDate, reference)).toBe(true);
      expect(isSameDateOnly(overdueDate, reference)).toBe(false);
    });
  });

  describe("edge cases and timezone safety", () => {
    it("does not suffer from timezone shift bugs with YYYY-MM-DD strings", () => {
      // The main goal: "2024-01-15" should be the same everywhere
      const dateStr = "2024-01-15";

      // Simulate being called at different times of day
      const morning = new Date("2024-01-15T06:00:00Z");
      const evening = new Date("2024-01-15T18:00:00Z");

      expect(isSameDateOnly(dateStr, morning)).toBe(true);
      expect(isSameDateOnly(dateStr, evening)).toBe(true);
      expect(formatDateOnly(dateStr, "en", "d.M")).toBe("15.1");
    });

    it("handles dates near year boundary", () => {
      const lastDayOfYear = "2023-12-31";
      const firstDayOfYear = "2024-01-01";

      const reference = new Date("2024-01-01T00:00:00Z");

      expect(isDateOnlyBefore(lastDayOfYear, reference)).toBe(true);
      expect(isSameDateOnly(firstDayOfYear, reference)).toBe(true);
    });

    it("handles dates near month boundary", () => {
      const lastDayOfMonth = "2024-01-31";
      const firstDayOfMonth = "2024-02-01";

      const reference = new Date("2024-02-01T00:00:00Z");

      expect(isDateOnlyBefore(lastDayOfMonth, reference)).toBe(true);
      expect(isSameDateOnly(firstDayOfMonth, reference)).toBe(true);
    });

    it("handles dates in leap vs non-leap years", () => {
      const leapYearDate = "2024-02-29";
      const nonLeapYearDate = "2023-02-28";

      const reference = new Date("2024-02-29T00:00:00Z");

      expect(isSameDateOnly(leapYearDate, reference)).toBe(true);
      expect(isDateOnlyBefore(nonLeapYearDate, reference)).toBe(true);
    });
  });
});
