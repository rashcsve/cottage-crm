import { describe, it, expect } from "vitest";
import type { Task } from "@/features/tasks/types/task.types";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";

describe("categorizeTasksForPage with consistent `today`", () => {
  const createTask = (overrides: Partial<Task>): Task => ({
    id: 1,
    title: "Task",
    description: null,
    status: "pending",
    priority: "medium",
    dueDate: "2024-01-15",
    dueKind: "overdue",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    completedAt: null,
    author: null,
    assignee: null,
    authorId: "user-1",
    ...overrides,
  });

  it("categorizes tasks using provided `today` consistently", () => {
    const today = "2024-01-20";
    const tasks = [
      createTask({ id: 1, dueDate: "2024-01-15", dueKind: "overdue" }),
      createTask({ id: 2, dueDate: "2024-01-20", dueKind: "dueToday" }),
      createTask({ id: 3, dueDate: "2024-01-25", dueKind: "dueOn" }),
      createTask({ id: 4, status: "done", dueKind: "completed" }),
    ];

    const result = categorizeTasksForPage(tasks, today);

    expect(result.overdueTasks).toEqual([tasks[0]]);
    expect(result.pendingTasks).toContainEqual(tasks[1]);
    expect(result.pendingTasks).toContainEqual(tasks[2]);
    expect(result.doneTasks).toEqual([tasks[3]]);
  });

  it("does not change categorization if called with same `today`", () => {
    const today = "2024-01-20";
    const tasks = [createTask({ dueDate: "2024-01-15", dueKind: "overdue" })];

    const result1 = categorizeTasksForPage(tasks, today);
    const result2 = categorizeTasksForPage(tasks, today);

    expect(result1.overdueTasks).toEqual(result2.overdueTasks);
    expect(result1.overdueCount).toBe(result2.overdueCount);
  });

  it("handles midnight boundary correctly with ISO date strings", () => {
    const today = "2024-01-20";
    const tasks = [
      createTask({ id: 1, dueDate: "2024-01-20", dueKind: "dueToday" }),
      createTask({ id: 2, dueDate: "2024-01-21", dueKind: "dueOn" }),
    ];

    const result = categorizeTasksForPage(tasks, today);

    expect(result.pendingCount).toBe(2);
    expect(result.overdueCount).toBe(0);
  });
});
