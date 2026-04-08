import { describe, it, expect } from "vitest";
import {
  categorizeTasksForPage,
  getFilteredTaskList,
  getFilteredListFromCategorized,
} from "@/features/tasks/domain/task-categorization";
import {
  REFERENCE_DATE,
  PAST_DATE,
  createTask,
  createOverdueTask,
  createDueTodayTask,
  createFutureTask,
  createCompletedTask,
  createTaskWithoutDueDate,
  createTaskList,
} from "@/tests/fixtures/task-fixtures";

describe("categorizeTasksForPage", () => {
  it("categorizes tasks into all three categories", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
      createCompletedTask({ id: 4 }),
      createCompletedTask({ id: 5 }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.pendingTasks).toHaveLength(3);
    expect(result.overdueTasks).toHaveLength(1);
    expect(result.doneTasks).toHaveLength(2);

    expect(result.pendingCount).toBe(3);
    expect(result.overdueCount).toBe(1);
    expect(result.doneCount).toBe(2);
  });

  it("returns empty arrays when no tasks exist", () => {
    const result = categorizeTasksForPage([], REFERENCE_DATE);

    expect(result.pendingTasks).toHaveLength(0);
    expect(result.overdueTasks).toHaveLength(0);
    expect(result.doneTasks).toHaveLength(0);

    expect(result.pendingCount).toBe(0);
    expect(result.overdueCount).toBe(0);
    expect(result.doneCount).toBe(0);
  });

  it("includes only overdue in overdueTasks", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.overdueTasks).toHaveLength(1);
    expect(result.overdueTasks[0].id).toBe(1);
  });

  it("handles tasks with no due date", () => {
    const tasks = [createTaskWithoutDueDate({ id: 1 })];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.pendingTasks).toContainEqual(tasks[0]);
    expect(result.overdueTasks).toHaveLength(0);
  });

  it("categorizes dueToday tasks as pending not overdue", () => {
    const tasks = [createDueTodayTask({ id: 1 }, REFERENCE_DATE)];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.pendingTasks).toContainEqual(tasks[0]);
    expect(result.overdueTasks).toHaveLength(0);
  });

  it("sorts done tasks by completion time newest first", () => {
    const tasks = [
      createCompletedTask({
        id: 1,
        completedAt: "2026-04-01T12:00:00.000Z",
      }),
      createCompletedTask({
        id: 2,
        completedAt: "2026-04-07T15:00:00.000Z",
      }),
      createCompletedTask({
        id: 3,
        completedAt: "2026-04-03T10:00:00.000Z",
      }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.doneTasks[0].id).toBe(2);
    expect(result.doneTasks[1].id).toBe(3);
    expect(result.doneTasks[2].id).toBe(1);
  });

  it("excludes completed tasks from pending and overdue", () => {
    const tasks = [
      createCompletedTask({ id: 1, dueDate: PAST_DATE }),
      createOverdueTask({ id: 2 }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.doneTasks).toHaveLength(1);
    expect(result.doneTasks[0].id).toBe(1);
    expect(result.overdueTasks).toHaveLength(1);
    expect(result.overdueTasks[0].id).toBe(2);
    expect(result.pendingTasks).toHaveLength(1);
    expect(result.pendingTasks[0].id).toBe(2);
  });

  it("handles large task lists efficiently", () => {
    const tasks = createTaskList(100);

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const total =
      result.pendingTasks.filter((task) => task.status === "pending").length +
      result.doneTasks.length;

    expect(total).toBe(100);
  });

  it("categorizes across different years correctly", () => {
    const today = "2026-01-01";
    const tasks = [
      createTask({
        id: 1,
        dueDate: "2025-12-31",
        status: "pending",
      }),
      createTask({
        id: 2,
        dueDate: today,
        status: "pending",
      }),
      createTask({
        id: 3,
        dueDate: "2026-01-02",
        status: "pending",
      }),
    ];

    const result = categorizeTasksForPage(tasks, today);

    expect(result.overdueTasks).toHaveLength(1);
    expect(result.overdueTasks[0].id).toBe(1);
    expect(result.pendingTasks).toHaveLength(3);
    expect(result.pendingTasks.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  it("handles midnight boundary correctly", () => {
    const today = REFERENCE_DATE;
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, today),
      createFutureTask({ id: 3 }),
    ];

    const result = categorizeTasksForPage(tasks, today);

    expect(result.overdueTasks).toHaveLength(1);
    expect(result.pendingTasks).toHaveLength(3);
  });

  it("maintains correct counts with mixed statuses", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createOverdueTask({ id: 2 }),
      createDueTodayTask({ id: 3 }, REFERENCE_DATE),
      createFutureTask({ id: 4 }),
      createCompletedTask({ id: 5 }),
      createCompletedTask({ id: 6 }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.overdueCount).toBe(2);
    expect(result.overdueCount).toBe(result.overdueTasks.length);
    expect(result.pendingCount).toBe(4);
    expect(result.pendingCount).toBe(result.pendingTasks.length);
    expect(result.doneCount).toBe(2);
    expect(result.doneCount).toBe(result.doneTasks.length);
  });
});

describe("getFilteredTaskList", () => {
  it("returns filtered overdue tasks with correct count", () => {
    const tasks = [createOverdueTask({ id: 1 }), createFutureTask({ id: 2 })];

    const result = getFilteredTaskList(tasks, "overdue", REFERENCE_DATE);

    expect(result.tasks).toHaveLength(1);
    expect(result.count).toBe(1);
    expect(result.tasks[0].id).toBe(1);
  });

  it("returns filtered pending tasks", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
    ];

    const result = getFilteredTaskList(tasks, "pending", REFERENCE_DATE);

    expect(result.tasks).toHaveLength(3);
    expect(result.count).toBe(3);
    expect(result.tasks.map((t) => t.id).sort()).toEqual([1, 2, 3]);
  });

  it("returns filtered done tasks with correct count", () => {
    const tasks = [
      createCompletedTask({ id: 1 }),
      createCompletedTask({ id: 2 }),
      createFutureTask({ id: 3 }),
    ];

    const result = getFilteredTaskList(tasks, "done", REFERENCE_DATE);

    expect(result.tasks).toHaveLength(2);
    expect(result.count).toBe(2);
  });
});

describe("getFilteredListFromCategorized", () => {
  it("extracts pending tasks from categorized data", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
    ];
    const categorized = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const result = getFilteredListFromCategorized(categorized, "pending");

    expect(result.tasks).toHaveLength(3);
    expect(result.count).toBe(3);
    expect(result.tasks.map((t) => t.id).sort()).toEqual([1, 2, 3]);
  });

  it("extracts overdue tasks from categorized data", () => {
    const tasks = [createOverdueTask({ id: 1 }), createFutureTask({ id: 2 })];
    const categorized = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const result = getFilteredListFromCategorized(categorized, "overdue");

    expect(result.tasks).toHaveLength(1);
    expect(result.count).toBe(1);
    expect(result.tasks[0].id).toBe(1);
  });

  it("extracts done tasks from categorized data", () => {
    const tasks = [
      createCompletedTask({ id: 1 }),
      createCompletedTask({ id: 2 }),
    ];
    const categorized = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const result = getFilteredListFromCategorized(categorized, "done");

    expect(result.tasks).toHaveLength(2);
    expect(result.count).toBe(2);
  });
});
