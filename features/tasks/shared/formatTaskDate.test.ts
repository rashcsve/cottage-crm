import { describe, expect, it } from "vitest";
import { formatTaskDueDate } from "./formatTaskDate";

describe("features/tasks/shared/formatTaskDate", () => {
  it("formats date-only values as compact due dates", () => {
    const isoDate = "2026-04-15";
    const utcDate = new Date(Date.UTC(2026, 3, 15, 0, 0, 0));

    expect(formatTaskDueDate(isoDate, "en")).toBe(
      formatTaskDueDate(utcDate, "en"),
    );
  });
});
