import { describe, expect, it } from "vitest";
import {
  filterOpenTasksByDue,
  getEndOfWeekIso,
} from "@/features/tasks/domain/due-filter";
import {
  createCompletedTask,
  createTask,
} from "@/tests/fixtures/task-fixtures";

function ids(tasks: { id: number }[]) {
  return tasks.map((task) => task.id);
}

describe("getEndOfWeekIso", () => {
  it.each([
    { weekday: "Monday", todayIso: "2026-10-26" },
    { weekday: "Tuesday", todayIso: "2026-10-27" },
    { weekday: "Wednesday", todayIso: "2026-10-28" },
    { weekday: "Thursday", todayIso: "2026-10-29" },
    { weekday: "Friday", todayIso: "2026-10-30" },
    { weekday: "Saturday", todayIso: "2026-10-31" },
  ])("returns the coming Sunday when today is $weekday", ({ todayIso }) => {
    expect(getEndOfWeekIso(todayIso)).toBe("2026-11-01");
  });

  it("returns today when today is Sunday", () => {
    expect(getEndOfWeekIso("2026-11-01")).toBe("2026-11-01");
  });

  it("rolls over into the next year", () => {
    expect(getEndOfWeekIso("2026-12-30")).toBe("2027-01-03");
  });
});

describe("filterOpenTasksByDue", () => {
  const todayIso = "2026-10-29";

  const overdue = createTask({ id: 1, dueDate: "2026-10-20", dueKind: "overdue" });
  const dueToday = createTask({ id: 2, dueDate: "2026-10-29", dueKind: "dueToday" });
  const dueSunday = createTask({ id: 3, dueDate: "2026-11-01", dueKind: "dueOn" });
  const dueNextMonday = createTask({ id: 4, dueDate: "2026-11-02", dueKind: "dueOn" });
  const undated = createTask({ id: 5, dueDate: null, dueKind: null });
  const tasks = [overdue, dueToday, dueSunday, dueNextMonday, undated];

  it("returns every task in its original order for all", () => {
    expect(ids(filterOpenTasksByDue(tasks, "all", todayIso))).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it("keeps overdue tasks and tasks due up to and including Sunday for week", () => {
    expect(ids(filterOpenTasksByDue(tasks, "week", todayIso))).toEqual([
      1, 2, 3,
    ]);
  });

  it("uses today as the week cutoff when today is Sunday", () => {
    const sundayTasks = [
      createTask({ id: 1, dueDate: "2026-11-01", dueKind: "dueToday" }),
      createTask({ id: 2, dueDate: "2026-11-02", dueKind: "dueOn" }),
    ];

    expect(ids(filterOpenTasksByDue(sundayTasks, "week", "2026-11-01"))).toEqual([
      1,
    ]);
  });

  it("keeps only tasks without a due date for none", () => {
    expect(ids(filterOpenTasksByDue(tasks, "none", todayIso))).toEqual([5]);
  });

  it.each(["week", "none"] as const)("ignores completed tasks for %s", (due) => {
    const completed = [
      createCompletedTask({ id: 6, dueDate: "2026-10-28" }),
      createCompletedTask({ id: 7, dueDate: null }),
    ];

    expect(filterOpenTasksByDue(completed, due, todayIso)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [undated, overdue];

    filterOpenTasksByDue(input, "week", todayIso);

    expect(ids(input)).toEqual([5, 1]);
  });
});
