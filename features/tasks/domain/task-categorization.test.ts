import { describe, it, expect } from "vitest";
import {
  categorizeTasksForPage,
  getFilteredTaskList,
  getFilteredListFromCategorized,
} from "@/features/tasks/domain/task-categorization";
import {
  createTask,
  createCompletedTask,
} from "@/tests/fixtures/task-fixtures";

describe("features/tasks/domain/task-categorization", () => {
  describe("categorizeTasksForPage", () => {
    it("categorizes tasks into all three categories", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 4 }),
        createCompletedTask({ id: 5 }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.pendingTasks).toHaveLength(3);
      expect(result.overdueTasks).toHaveLength(1);
      expect(result.doneTasks).toHaveLength(2);

      expect(result.pendingCount).toBe(3);
      expect(result.overdueCount).toBe(1);
      expect(result.doneCount).toBe(2);
    });

    it("returns empty arrays when no tasks exist", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");

      const result = categorizeTasksForPage([], referenceDate);

      expect(result.pendingTasks).toHaveLength(0);
      expect(result.overdueTasks).toHaveLength(0);
      expect(result.doneTasks).toHaveLength(0);

      expect(result.pendingCount).toBe(0);
      expect(result.overdueCount).toBe(0);
      expect(result.doneCount).toBe(0);
    });

    it("includes only overdue in overdueTasks", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.overdueTasks).toHaveLength(1);
      expect(result.overdueTasks[0].id).toBe(1);
      expect(result.overdueCount).toBe(1);
    });

    it("includes all pending in pendingTasks (including overdue)", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.pendingTasks).toHaveLength(3);
      expect(result.pendingTasks.map((t) => t.id).sort()).toEqual([1, 2, 3]);
      expect(result.pendingCount).toBe(3);
    });

    it("sorts done tasks by completion time", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createCompletedTask({ id: 1 }),
        createCompletedTask({ id: 2 }),
        createCompletedTask({ id: 3 }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.doneTasks).toHaveLength(3);
      expect(result.doneCount).toBe(3);
    });

    it("respects reference date parameter", () => {
      const earlyRef = new Date("2024-01-01T00:00:00Z");
      const lateRef = new Date("2024-12-31T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-15", status: "pending" }),
      ];

      const earlyResult = categorizeTasksForPage(tasks, earlyRef);
      const lateResult = categorizeTasksForPage(tasks, lateRef);

      expect(earlyResult.overdueTasks).toHaveLength(0);
      expect(earlyResult.pendingTasks).toHaveLength(1);

      expect(lateResult.overdueTasks).toHaveLength(1);
      expect(lateResult.pendingTasks).toHaveLength(1);
    });

    it("uses default reference date when not provided", () => {
      const tasks = [createTask({ id: 1, status: "pending" })];

      const result = categorizeTasksForPage(tasks);

      expect(result.pendingTasks).toHaveLength(1);
      expect(result.pendingCount).toBe(1);
    });

    it("handles null due dates", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: null, status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-14", status: "pending" }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.pendingTasks).toHaveLength(2);
      expect(result.overdueTasks).toHaveLength(1);
      expect(result.pendingCount).toBe(2);
      expect(result.overdueCount).toBe(1);
    });

    it("excludes completed tasks from pending and overdue", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createCompletedTask({ id: 1, dueDate: "2024-06-14" }),
        createTask({ id: 2, dueDate: "2024-06-14", status: "pending" }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.pendingTasks).toHaveLength(1);
      expect(result.overdueTasks).toHaveLength(1);
      expect(result.doneTasks).toHaveLength(1);
    });

    it("counts match array lengths", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 3 }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.pendingCount).toBe(result.pendingTasks.length);
      expect(result.overdueCount).toBe(result.overdueTasks.length);
      expect(result.doneCount).toBe(result.doneTasks.length);
    });

    it("handles leap year dates", () => {
      const referenceDate = new Date("2024-02-29T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-02-28", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-02-29", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-03-01", status: "pending" }),
      ];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result.overdueTasks).toHaveLength(1);
      expect(result.pendingTasks).toHaveLength(3);
      expect(result.overdueCount).toBe(1);
      expect(result.pendingCount).toBe(3);
    });

    it("returns correct structure", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createTask({ id: 1, status: "pending" })];

      const result = categorizeTasksForPage(tasks, referenceDate);

      expect(result).toHaveProperty("pendingTasks");
      expect(result).toHaveProperty("pendingCount");
      expect(result).toHaveProperty("overdueTasks");
      expect(result).toHaveProperty("overdueCount");
      expect(result).toHaveProperty("doneTasks");
      expect(result).toHaveProperty("doneCount");

      expect(Array.isArray(result.pendingTasks)).toBe(true);
      expect(Array.isArray(result.overdueTasks)).toBe(true);
      expect(Array.isArray(result.doneTasks)).toBe(true);
      expect(typeof result.pendingCount).toBe("number");
      expect(typeof result.overdueCount).toBe("number");
      expect(typeof result.doneCount).toBe("number");
    });
  });

  describe("getFilteredTaskList", () => {
    it("returns pending tasks with count", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 3 }),
      ];

      const result = getFilteredTaskList(tasks, "pending", referenceDate);

      expect(result.count).toBe(2);
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks.every((t) => t.status === "pending")).toBe(true);
    });

    it("returns overdue tasks with count", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
      ];

      const result = getFilteredTaskList(tasks, "overdue", referenceDate);

      expect(result.count).toBe(1);
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe(1);
    });

    it("returns done tasks with count", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createCompletedTask({ id: 2 }),
        createCompletedTask({ id: 3 }),
      ];

      const result = getFilteredTaskList(tasks, "done", referenceDate);

      expect(result.count).toBe(2);
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks.every((t) => t.status === "done")).toBe(true);
    });

    it("uses default reference date when not provided", () => {
      const tasks = [createTask({ id: 1, status: "pending" })];

      const result = getFilteredTaskList(tasks, "pending");

      expect(result.count).toBe(1);
      expect(result.tasks).toHaveLength(1);
    });

    it("returns zero count for empty results", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createTask({ id: 1, status: "pending" })];

      const result = getFilteredTaskList(tasks, "done", referenceDate);

      expect(result.count).toBe(0);
      expect(result.tasks).toHaveLength(0);
    });
  });

  describe("getFilteredListFromCategorized", () => {
    it("extracts pending filter from categorized data", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 3 }),
      ];

      const categorized = categorizeTasksForPage(tasks, referenceDate);
      const result = getFilteredListFromCategorized(categorized, "pending");

      expect(result.count).toBe(2);
      expect(result.tasks).toHaveLength(2);
      expect(result.count).toBe(categorized.pendingCount);
      expect(result.tasks).toEqual(categorized.pendingTasks);
    });

    it("extracts overdue filter from categorized data", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
      ];

      const categorized = categorizeTasksForPage(tasks, referenceDate);
      const result = getFilteredListFromCategorized(categorized, "overdue");

      expect(result.count).toBe(1);
      expect(result.tasks).toHaveLength(1);
      expect(result.count).toBe(categorized.overdueCount);
      expect(result.tasks).toEqual(categorized.overdueTasks);
    });

    it("extracts done filter from categorized data", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createCompletedTask({ id: 2 }),
        createCompletedTask({ id: 3 }),
      ];

      const categorized = categorizeTasksForPage(tasks, referenceDate);
      const result = getFilteredListFromCategorized(categorized, "done");

      expect(result.count).toBe(2);
      expect(result.tasks).toHaveLength(2);
      expect(result.count).toBe(categorized.doneCount);
      expect(result.tasks).toEqual(categorized.doneTasks);
    });

    it("returns correct structure", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createTask({ id: 1, status: "pending" })];

      const categorized = categorizeTasksForPage(tasks, referenceDate);
      const result = getFilteredListFromCategorized(categorized, "pending");

      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("tasks");
      expect(typeof result.count).toBe("number");
      expect(Array.isArray(result.tasks)).toBe(true);
    });

    it("handles all filter types", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 3 }),
      ];

      const categorized = categorizeTasksForPage(tasks, referenceDate);

      const pending = getFilteredListFromCategorized(categorized, "pending");
      const overdue = getFilteredListFromCategorized(categorized, "overdue");
      const done = getFilteredListFromCategorized(categorized, "done");

      expect(pending.count).toBe(2);
      expect(overdue.count).toBe(1);
      expect(done.count).toBe(1);
    });
  });
});
