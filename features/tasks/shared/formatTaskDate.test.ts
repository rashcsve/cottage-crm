import { describe, expect, it } from "vitest";
import { formatTaskDueDate, formatTaskTimestamp } from "./formatTaskDate";

describe("features/tasks/shared/formatTaskDate", () => {
  it("formats date-only values as compact due dates", () => {
    const isoDate = "2026-04-15";
    const utcDate = new Date(Date.UTC(2026, 3, 15, 0, 0, 0));

    expect(formatTaskDueDate(isoDate, "en")).toBe(
      formatTaskDueDate(utcDate, "en"),
    );
  });

  it("formats timestamps with locale-aware date and time", () => {
    const isoDate = "2026-04-22T14:35:00.000Z";
    const utcDate = new Date(Date.UTC(2026, 3, 22, 14, 35, 0));

    expect(formatTaskTimestamp(isoDate, "en")).toBe(
      formatTaskTimestamp(utcDate, "en"),
    );
  });

  it("falls back to the original string for invalid timestamps", () => {
    expect(formatTaskTimestamp("not-a-date", "en")).toBe("not-a-date");
  });
});
