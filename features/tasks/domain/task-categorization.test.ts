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
  it("categorizes tasks into open, overdue, on-track, and done collections", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
      createCompletedTask({ id: 4 }),
      createCompletedTask({ id: 5 }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.openTasks).toHaveLength(3);
    expect(result.overdueTasks).toHaveLength(1);
    expect(result.onTrackTasks).toHaveLength(2);
    expect(result.doneTasks).toHaveLength(2);

    expect(result.openCount).toBe(3);
    expect(result.overdueCount).toBe(1);
    expect(result.onTrackCount).toBe(2);
    expect(result.doneCount).toBe(2);
  });

  it("returns empty arrays when no tasks exist", () => {
    const result = categorizeTasksForPage([], REFERENCE_DATE);

    expect(result.openTasks).toHaveLength(0);
    expect(result.overdueTasks).toHaveLength(0);
    expect(result.onTrackTasks).toHaveLength(0);
    expect(result.doneTasks).toHaveLength(0);

    expect(result.openCount).toBe(0);
    expect(result.overdueCount).toBe(0);
    expect(result.onTrackCount).toBe(0);
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

    expect(result.openTasks).toContainEqual(tasks[0]);
    expect(result.overdueTasks).toHaveLength(0);
    expect(result.onTrackTasks).toContainEqual(tasks[0]);
  });

  it("categorizes dueToday tasks as open not overdue", () => {
    const tasks = [createDueTodayTask({ id: 1 }, REFERENCE_DATE)];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.openTasks).toContainEqual(tasks[0]);
    expect(result.overdueTasks).toHaveLength(0);
    expect(result.onTrackTasks).toContainEqual(tasks[0]);
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

  it("keeps overdue tasks visible inside the broader open working set", () => {
    const tasks = [
      createCompletedTask({ id: 1, dueDate: PAST_DATE }),
      createOverdueTask({ id: 2 }),
    ];

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    expect(result.doneTasks).toHaveLength(1);
    expect(result.doneTasks[0].id).toBe(1);
    expect(result.overdueTasks).toHaveLength(1);
    expect(result.overdueTasks[0].id).toBe(2);
    expect(result.openTasks).toHaveLength(1);
    expect(result.openTasks[0].id).toBe(2);
    expect(result.onTrackTasks).toHaveLength(0);
  });

  it("handles large task lists efficiently", () => {
    const tasks = createTaskList(100);

    const result = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const total = result.openTasks.length + result.doneTasks.length;

    expect(total).toBe(100);
    expect(result.overdueTasks.length).toBeLessThanOrEqual(result.openTasks.length);
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
    expect(result.openTasks).toHaveLength(3);
    expect(result.openTasks.map((t) => t.id)).toEqual([1, 2, 3]);
    expect(result.onTrackTasks).toHaveLength(2);
    expect(result.onTrackTasks.map((t) => t.id)).toEqual([2, 3]);
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
    expect(result.openTasks).toHaveLength(3);
    expect(result.onTrackTasks).toHaveLength(2);
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
    expect(result.onTrackCount).toBe(2);
    expect(result.onTrackCount).toBe(result.onTrackTasks.length);
    expect(result.openCount).toBe(4);
    expect(result.openCount).toBe(result.openTasks.length);
    expect(result.doneCount).toBe(2);
    expect(result.doneCount).toBe(result.doneTasks.length);
  });
});

describe("getFilteredTaskList", () => {
  it("returns filtered open tasks", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
    ];

    const result = getFilteredTaskList(tasks, "open", REFERENCE_DATE);

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
  it("extracts open tasks from categorized data", () => {
    const tasks = [
      createOverdueTask({ id: 1 }),
      createDueTodayTask({ id: 2 }, REFERENCE_DATE),
      createFutureTask({ id: 3 }),
    ];
    const categorized = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const result = getFilteredListFromCategorized(categorized, "open");

    expect(result.tasks).toHaveLength(3);
    expect(result.count).toBe(3);
    expect(result.tasks.map((t) => t.id).sort()).toEqual([1, 2, 3]);
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
