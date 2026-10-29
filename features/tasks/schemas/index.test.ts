import { describe, expect, it } from "vitest";
import { parseTasksSearchParams, TaskDueFilterSchema } from "./index";

describe("TaskDueFilterSchema", () => {
  it.each(["all", "week", "none"] as const)("accepts %s", (value) => {
    expect(TaskDueFilterSchema.parse(value)).toBe(value);
  });

  it.each([
    { label: "an unknown value", value: "bogus" },
    { label: "a missing value", value: undefined },
    { label: "a repeated param", value: ["week", "none"] },
  ])("falls back to all for $label when used with catch", ({ value }) => {
    expect(TaskDueFilterSchema.catch("all").parse(value)).toBe("all");
  });
});

describe("parseTasksSearchParams", () => {
  it("defaults to the open view with all due dates", () => {
    expect(parseTasksSearchParams({})).toEqual({
      activeFilter: "open",
      activeDue: "all",
    });
  });

  it("keeps the due chip in the open view", () => {
    expect(parseTasksSearchParams({ filter: "open", due: "week" })).toEqual({
      activeFilter: "open",
      activeDue: "week",
    });
  });

  it("drops the due chip in the completed view", () => {
    expect(parseTasksSearchParams({ filter: "done", due: "week" })).toEqual({
      activeFilter: "done",
      activeDue: "all",
    });
  });

  it("falls back to open and all for bogus values", () => {
    expect(parseTasksSearchParams({ filter: "bogus", due: "bogus" })).toEqual({
      activeFilter: "open",
      activeDue: "all",
    });
  });
});
