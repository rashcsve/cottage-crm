import { describe, expect, it } from "vitest";
import { resolveDueDateChoice } from "@/features/tasks/domain/due-date-choice";

describe("resolveDueDateChoice", () => {
  it("returns today for today", () => {
    expect(resolveDueDateChoice("today", "2026-10-29", "")).toBe("2026-10-29");
  });

  it.each([
    { label: "within a month", todayIso: "2026-10-28", expected: "2026-10-29" },
    { label: "across a month", todayIso: "2026-10-31", expected: "2026-11-01" },
    { label: "across a year", todayIso: "2026-12-31", expected: "2027-01-01" },
    { label: "across February in a leap year", todayIso: "2028-02-28", expected: "2028-02-29" },
  ])("returns the next day for tomorrow $label", ({ todayIso, expected }) => {
    expect(resolveDueDateChoice("tomorrow", todayIso, "")).toBe(expected);
  });

  it.each([
    { weekday: "Monday", todayIso: "2026-10-26" },
    { weekday: "Tuesday", todayIso: "2026-10-27" },
    { weekday: "Wednesday", todayIso: "2026-10-28" },
    { weekday: "Thursday", todayIso: "2026-10-29" },
    { weekday: "Friday", todayIso: "2026-10-30" },
  ])("returns the coming Saturday for weekend on $weekday", ({ todayIso }) => {
    expect(resolveDueDateChoice("weekend", todayIso, "")).toBe("2026-10-31");
  });

  it.each([
    { weekday: "Saturday", todayIso: "2026-10-31" },
    { weekday: "Sunday", todayIso: "2026-11-01" },
  ])("returns today for weekend on $weekday", ({ todayIso }) => {
    expect(resolveDueDateChoice("weekend", todayIso, "")).toBe(todayIso);
  });

  it("rolls the weekend over into the next year", () => {
    expect(resolveDueDateChoice("weekend", "2026-12-28", "")).toBe("2027-01-02");
  });

  it.each(["", "2026-11-15", "not-a-date"])(
    "passes the picked date %j through as-is for pick",
    (pickedDate) => {
      expect(resolveDueDateChoice("pick", "2026-10-29", pickedDate)).toBe(
        pickedDate,
      );
    },
  );

  it("returns an empty string for none, ignoring the picked date", () => {
    expect(resolveDueDateChoice("none", "2026-10-29", "2026-11-15")).toBe("");
  });

  it.each(["today", "tomorrow", "weekend"] as const)(
    "ignores the picked date for %s",
    (choice) => {
      expect(resolveDueDateChoice(choice, "2026-10-29", "2026-11-15")).not.toBe(
        "2026-11-15",
      );
    },
  );
});
