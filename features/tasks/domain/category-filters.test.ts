import { describe, it, expect } from "vitest";
import {
  getTasksByStatus,
  getOverdueTasks,
  getTasksByFilter,
  countTasksByCategory,
} from "@/features/tasks/domain/category-filters";
import {
  createTask,
  createCompletedTask,
} from "@/tests/fixtures/task-fixtures";

describe("features/tasks/domain/category-filters", () => {
  describe("getTasksByStatus", () => {
    it("returns only pending tasks", () => {
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createTask({ id: 2, status: "done" }),
        createTask({ id: 3, status: "pending" }),
      ];

      const result = getTasksByStatus(tasks, "pending");

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.status === "pending")).toBe(true);
    });

    it("returns only done tasks", () => {
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createTask({ id: 2, status: "done" }),
        createTask({ id: 3, status: "done" }),
      ];

      const result = getTasksByStatus(tasks, "done");

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.status === "done")).toBe(true);
    });

    it("returns empty array if no matching status", () => {
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createTask({ id: 2, status: "pending" }),
      ];

      const result = getTasksByStatus(tasks, "done");

      expect(result).toHaveLength(0);
    });

    it("returns empty array for empty input", () => {
      const result = getTasksByStatus([], "pending");
      expect(result).toHaveLength(0);
    });
  });

  describe("getOverdueTasks", () => {
    it("returns only overdue tasks", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 4, dueDate: "2020-01-01" }),
      ];

      const result = getOverdueTasks(tasks, referenceDate);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("excludes completed tasks even if they were overdue", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createCompletedTask({ id: 1, dueDate: "2020-01-01" }),
        createTask({ id: 2, dueDate: "2024-06-14", status: "pending" }),
      ];

      const result = getOverdueTasks(tasks, referenceDate);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("pending");
    });

    it("respects reference date parameter", () => {
      const earlyReference = new Date("2024-01-01T00:00:00Z");
      const lateReference = new Date("2024-12-31T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-15", status: "pending" }),
      ];

      const earlyResult = getOverdueTasks(tasks, earlyReference);
      const lateResult = getOverdueTasks(tasks, lateReference);

      expect(earlyResult).toHaveLength(0);
      expect(lateResult).toHaveLength(1);
    });

    it("returns empty array if no overdue tasks", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-16", status: "pending" }),
      ];

      const result = getOverdueTasks(tasks, referenceDate);

      expect(result).toHaveLength(0);
    });

    it("handles null due dates", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createTask({ id: 1, dueDate: null, status: "pending" })];

      const result = getOverdueTasks(tasks, referenceDate);

      expect(result).toHaveLength(0);
    });
  });

  describe("getTasksByFilter", () => {
    it("returns all pending tasks for 'pending' filter (includes overdue)", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 4 }),
      ];

      const result = getTasksByFilter(tasks, "pending", referenceDate);

      expect(result).toHaveLength(3);
      expect(result.every((t) => t.status === "pending")).toBe(true);
    });

    it("returns overdue tasks for 'overdue' filter", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
      ];

      const result = getTasksByFilter(tasks, "overdue", referenceDate);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("returns done tasks for 'done' filter", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createCompletedTask({ id: 2 }),
        createCompletedTask({ id: 3 }),
      ];

      const result = getTasksByFilter(tasks, "done", referenceDate);

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.status === "done")).toBe(true);
    });

    it("uses default reference date (today) when not provided", () => {
      const tasks = [createTask({ id: 1, status: "pending" })];

      const result = getTasksByFilter(tasks, "pending");

      expect(result).toHaveLength(1);
    });

    it("sorts done tasks by completion time", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createCompletedTask({ id: 1 }),
        createCompletedTask({ id: 2 }),
        createCompletedTask({ id: 3 }),
      ];

      const result = getTasksByFilter(tasks, "done", referenceDate);

      expect(result).toHaveLength(3);
    });

    it("returns empty array if no tasks match filter", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createCompletedTask({ id: 1 })];

      const result = getTasksByFilter(tasks, "pending", referenceDate);

      expect(result).toHaveLength(0);
    });
  });

  describe("countTasksByCategory", () => {
    it("counts tasks correctly in each category", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 4 }),
        createCompletedTask({ id: 5 }),
      ];

      const counts = countTasksByCategory(tasks, referenceDate);

      expect(counts.overdueCount).toBe(1);
      expect(counts.pendingCount).toBe(3);
      expect(counts.doneCount).toBe(2);
      expect(counts.totalCount).toBe(5);
    });

    it("sums to total count", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
        createCompletedTask({ id: 3 }),
      ];

      const counts = countTasksByCategory(tasks, referenceDate);

      expect(counts.doneCount + counts.pendingCount).toBe(counts.totalCount);
    });

    it("handles empty task list", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");

      const counts = countTasksByCategory([], referenceDate);

      expect(counts.pendingCount).toBe(0);
      expect(counts.overdueCount).toBe(0);
      expect(counts.doneCount).toBe(0);
      expect(counts.totalCount).toBe(0);
    });

    it("uses default reference date (today) when not provided", () => {
      const tasks = [
        createTask({ id: 1, status: "pending" }),
        createCompletedTask({ id: 2 }),
      ];

      const counts = countTasksByCategory(tasks);

      expect(counts.pendingCount).toBe(1);
      expect(counts.doneCount).toBe(1);
    });

    it("includes overdue in pending count", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-06-15", status: "pending" }),
      ];

      const counts = countTasksByCategory(tasks, referenceDate);

      expect(counts.overdueCount).toBe(1);
      expect(counts.pendingCount).toBe(2);
      expect(counts.totalCount).toBe(2);
    });

    it("counts tasks with null due dates as pending", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createTask({ id: 1, dueDate: null, status: "pending" })];

      const counts = countTasksByCategory(tasks, referenceDate);

      expect(counts.pendingCount).toBe(1);
      expect(counts.overdueCount).toBe(0);
    });
  });

  describe("integration: filtering workflow", () => {
    it("filters correctly across all categories", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [
        createTask({ id: 101, dueDate: "2024-06-14", status: "pending" }),
        createTask({ id: 102, dueDate: "2024-06-15", status: "pending" }),
        createTask({ id: 103, dueDate: "2024-06-16", status: "pending" }),
        createCompletedTask({ id: 104 }),
        createCompletedTask({ id: 105 }),
      ];

      const overdue = getTasksByFilter(tasks, "overdue", referenceDate);
      const pending = getTasksByFilter(tasks, "pending", referenceDate);
      const done = getTasksByFilter(tasks, "done", referenceDate);

      expect(overdue).toHaveLength(1);
      expect(pending).toHaveLength(3);
      expect(done).toHaveLength(2);

      const counts = countTasksByCategory(tasks, referenceDate);
      expect(overdue.length).toBe(counts.overdueCount);
      expect(pending.length).toBe(counts.pendingCount);
      expect(done.length).toBe(counts.doneCount);
    });

    it("handles time-based transitions", () => {
      const tasks = [
        createTask({ id: 1, dueDate: "2024-06-16", status: "pending" }),
      ];

      const todayRef = new Date("2024-06-15T00:00:00Z");
      const tomorrowRef = new Date("2024-06-16T00:00:00Z");
      const afterTomorrow = new Date("2024-06-17T00:00:00Z");

      const tomorrowPending = getTasksByFilter(tasks, "pending", todayRef);
      expect(tomorrowPending).toHaveLength(1);

      const todayPending = getTasksByFilter(tasks, "pending", tomorrowRef);
      expect(todayPending).toHaveLength(1);

      const overdue = getOverdueTasks(tasks, afterTomorrow);
      expect(overdue).toHaveLength(1);
    });
  });

  describe("edge cases", () => {
    it("handles tasks with no due date", () => {
      const referenceDate = new Date("2024-06-15T00:00:00Z");
      const tasks = [createTask({ id: 1, dueDate: null, status: "pending" })];

      const pending = getTasksByFilter(tasks, "pending", referenceDate);
      const overdue = getTasksByFilter(tasks, "overdue", referenceDate);

      expect(pending).toHaveLength(1);
      expect(overdue).toHaveLength(0);
    });

    it("handles leap year dates", () => {
      const referenceDate = new Date("2024-02-29T00:00:00Z");
      const tasks = [
        createTask({ id: 1, dueDate: "2024-02-28", status: "pending" }),
        createTask({ id: 2, dueDate: "2024-02-29", status: "pending" }),
        createTask({ id: 3, dueDate: "2024-03-01", status: "pending" }),
      ];

      const overdue = getOverdueTasks(tasks, referenceDate);
      const pending = getTasksByFilter(tasks, "pending", referenceDate);

      expect(overdue).toHaveLength(1);
      expect(pending).toHaveLength(3);
    });
  });
});
