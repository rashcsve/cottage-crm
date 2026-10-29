import { describe, expect, it } from "vitest";
import { groupOpenTasksByUrgency } from "@/features/tasks/domain/urgency-groups";
import {
  createCompletedTask,
  createTask,
} from "@/tests/fixtures/task-fixtures";

function ids(tasks: { id: number }[]) {
  return tasks.map((task) => task.id);
}

describe("groupOpenTasksByUrgency", () => {
  it("returns three empty groups when there are no tasks", () => {
    expect(groupOpenTasksByUrgency([])).toEqual({
      needsAttention: [],
      today: [],
      later: [],
    });
  });

  it("puts overdue tasks in needs attention, due-today in today, and future or undated in later", () => {
    const overdue = createTask({ id: 1, dueDate: "2026-04-01", dueKind: "overdue" });
    const dueToday = createTask({ id: 2, dueDate: "2026-04-07", dueKind: "dueToday" });
    const future = createTask({ id: 3, dueDate: "2026-04-20", dueKind: "dueOn" });
    const undated = createTask({ id: 4, dueDate: null, dueKind: null });

    const groups = groupOpenTasksByUrgency([undated, future, dueToday, overdue]);

    expect(ids(groups.needsAttention)).toEqual([1]);
    expect(ids(groups.today)).toEqual([2]);
    expect(ids(groups.later)).toEqual([3, 4]);
  });

  it("ignores completed tasks even when they have a past due date", () => {
    const groups = groupOpenTasksByUrgency([
      createCompletedTask({ id: 1, dueDate: "2026-04-01" }),
      createCompletedTask({ id: 2, dueDate: null }),
    ]);

    expect(groups).toEqual({ needsAttention: [], today: [], later: [] });
  });

  it("orders needs attention by oldest due date first", () => {
    const groups = groupOpenTasksByUrgency([
      createTask({ id: 1, dueDate: "2026-04-05", dueKind: "overdue" }),
      createTask({ id: 2, dueDate: "2026-03-01", dueKind: "overdue" }),
      createTask({ id: 3, dueDate: "2026-04-01", dueKind: "overdue" }),
    ]);

    expect(ids(groups.needsAttention)).toEqual([2, 3, 1]);
  });

  it("orders today by newest created first", () => {
    const groups = groupOpenTasksByUrgency([
      createTask({ id: 1, dueKind: "dueToday", createdAt: "2026-04-01T08:00:00Z" }),
      createTask({ id: 2, dueKind: "dueToday", createdAt: "2026-04-06T08:00:00Z" }),
      createTask({ id: 3, dueKind: "dueToday", createdAt: "2026-04-03T08:00:00Z" }),
    ]);

    expect(ids(groups.today)).toEqual([2, 3, 1]);
  });

  it("orders later by due date ascending, then undated tasks newest created first", () => {
    const groups = groupOpenTasksByUrgency([
      createTask({ id: 1, dueDate: null, dueKind: null, createdAt: "2026-04-01T08:00:00Z" }),
      createTask({ id: 2, dueDate: "2026-05-10", dueKind: "dueOn" }),
      createTask({ id: 3, dueDate: null, dueKind: null, createdAt: "2026-04-05T08:00:00Z" }),
      createTask({ id: 4, dueDate: "2026-04-10", dueKind: "dueOn" }),
    ]);

    expect(ids(groups.later)).toEqual([4, 2, 3, 1]);
  });

  it("puts a pending dated task without a due kind in later instead of dropping it", () => {
    const groups = groupOpenTasksByUrgency([
      createTask({ id: 1, dueDate: null, dueKind: null }),
      createTask({ id: 2, dueDate: "2026-04-20", dueKind: null }),
    ]);

    expect(groups.needsAttention).toEqual([]);
    expect(groups.today).toEqual([]);
    expect(ids(groups.later)).toEqual([2, 1]);
  });

  it("keeps the original order for tasks that tie on the sort key", () => {
    const groups = groupOpenTasksByUrgency([
      createTask({ id: 1, dueDate: "2026-04-01", dueKind: "overdue" }),
      createTask({ id: 2, dueDate: "2026-04-01", dueKind: "overdue" }),
      createTask({ id: 3, dueDate: "2026-04-01", dueKind: "overdue" }),
    ]);

    expect(ids(groups.needsAttention)).toEqual([1, 2, 3]);
  });

  it("does not mutate the input array", () => {
    const tasks = [
      createTask({ id: 1, dueDate: "2026-04-05", dueKind: "overdue" }),
      createTask({ id: 2, dueDate: "2026-03-01", dueKind: "overdue" }),
    ];

    groupOpenTasksByUrgency(tasks);

    expect(ids(tasks)).toEqual([1, 2]);
  });
});
