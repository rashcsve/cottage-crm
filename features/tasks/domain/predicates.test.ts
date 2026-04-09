import { describe, it, expect } from "vitest";
import {
  isTaskOverdue,
  deriveTaskDueKind,
} from "@/features/tasks/domain/predicates";
import {
  REFERENCE_DATE,
  PAST_DATE,
  createOverdueTask,
  createDueTodayTask,
  createFutureTask,
  createCompletedTask,
  createTaskWithoutDueDate,
} from "@/tests/fixtures/task-fixtures";
import { TaskStatus } from "../types/tasks";

describe("features/tasks/domain/predicates", () => {
  describe("isTaskOverdue", () => {
    it("returns true for overdue pending tasks", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createOverdueTask();

      const result = isTaskOverdue(task.dueDate, task.status, referenceDate);

      expect(result).toBe(true);
    });

    it("returns false for completed tasks regardless of due date", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createCompletedTask({ dueDate: PAST_DATE });

      const result = isTaskOverdue(task.dueDate, task.status, referenceDate);

      expect(result).toBe(false);
    });

    it("returns false for tasks due today", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createDueTodayTask({}, REFERENCE_DATE);

      const result = isTaskOverdue(task.dueDate, task.status, referenceDate);

      expect(result).toBe(false);
    });

    it("returns false for future tasks", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createFutureTask();

      const result = isTaskOverdue(task.dueDate, task.status, referenceDate);

      expect(result).toBe(false);
    });

    it("returns false for tasks without due date", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createTaskWithoutDueDate();

      const result = isTaskOverdue(task.dueDate, task.status, referenceDate);

      expect(result).toBe(false);
    });

    it("respects reference date parameter", () => {
      const earlyRef = new Date("2026-04-05T00:00:00Z");
      const lateRef = new Date("2026-04-08T00:00:00Z");
      const task = createDueTodayTask({}, REFERENCE_DATE);

      const earlyResult = isTaskOverdue(task.dueDate, task.status, earlyRef);
      const lateResult = isTaskOverdue(task.dueDate, task.status, lateRef);

      expect(earlyResult).toBe(false);
      expect(lateResult).toBe(true);
    });

    it("uses default reference date (today) when not provided", () => {
      const task = createFutureTask();

      const result = isTaskOverdue(task.dueDate, task.status, new Date());

      expect(result).toBe(false);
    });
  });

  describe("deriveTaskDueKind", () => {
    it("returns 'completed' for done tasks", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createCompletedTask();

      const result = deriveTaskDueKind(
        task.dueDate,
        task.status,
        referenceDate
      );

      expect(result).toBe("completed");
    });

    it("returns 'overdue' for pending tasks with past due date", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createOverdueTask();

      const result = deriveTaskDueKind(
        task.dueDate,
        task.status,
        referenceDate
      );

      expect(result).toBe("overdue");
    });

    it("returns 'dueToday' for pending tasks due today", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createDueTodayTask({}, REFERENCE_DATE);

      const result = deriveTaskDueKind(
        task.dueDate,
        task.status,
        referenceDate
      );

      expect(result).toBe("dueToday");
    });

    it("returns 'dueOn' for pending tasks with future due date", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createFutureTask();

      const result = deriveTaskDueKind(
        task.dueDate,
        task.status,
        referenceDate
      );

      expect(result).toBe("dueOn");
    });

    it("returns null for pending tasks without due date", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createTaskWithoutDueDate();

      const result = deriveTaskDueKind(
        task.dueDate,
        task.status,
        referenceDate
      );

      expect(result).toBeNull();
    });

    it("respects reference date parameter", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const task = createDueTodayTask({}, REFERENCE_DATE);

      expect(deriveTaskDueKind(task.dueDate, "pending", referenceDate)).toBe(
        "dueToday"
      );
      expect(
        deriveTaskDueKind(task.dueDate, "pending", new Date("2026-04-08"))
      ).toBe("overdue");
      expect(
        deriveTaskDueKind(task.dueDate, "pending", new Date("2026-04-06"))
      ).toBe("dueOn");
    });

    it("uses default reference date (today) when not provided", () => {
      const task = createFutureTask();

      const result = deriveTaskDueKind(task.dueDate, task.status, new Date());

      expect(result).toBe("dueOn");
    });
  });

  describe("edge cases and timezone safety", () => {
    it("produces consistent results regardless of time of day", () => {
      const earlyMorning = new Date(`${REFERENCE_DATE}T01:00:00Z`);
      const afternoon = new Date(`${REFERENCE_DATE}T12:00:00Z`);
      const lateEvening = new Date(`${REFERENCE_DATE}T23:59:59Z`);

      const scenarios = [
        { task: createOverdueTask(), expected: "overdue" },
        { task: createDueTodayTask({}, REFERENCE_DATE), expected: "dueToday" },
        { task: createFutureTask(), expected: "dueOn" },
      ];

      scenarios.forEach(({ task, expected }) => {
        const resultMorning = deriveTaskDueKind(
          task.dueDate,
          task.status,
          earlyMorning
        );
        const resultAfternoon = deriveTaskDueKind(
          task.dueDate,
          task.status,
          afternoon
        );
        const resultEvening = deriveTaskDueKind(
          task.dueDate,
          task.status,
          lateEvening
        );

        expect(resultMorning).toBe(expected);
        expect(resultAfternoon).toBe(expected);
        expect(resultEvening).toBe(expected);
      });
    });

    it("does not throw on invalid dates", () => {
      const referenceDate = new Date(REFERENCE_DATE);

      expect(() => {
        deriveTaskDueKind("invalid-date", "pending", referenceDate);
      }).not.toThrow();

      expect(() => {
        isTaskOverdue("invalid-date", "pending", referenceDate);
      }).not.toThrow();
    });

    it("handles all status and due date combinations", () => {
      const referenceDate = new Date(REFERENCE_DATE);
      const statusValues: TaskStatus[] = ["pending", "done"];
      const tasks = [
        createOverdueTask(),
        createDueTodayTask({}, REFERENCE_DATE),
        createFutureTask(),
        createTaskWithoutDueDate(),
        createCompletedTask(),
      ];

      statusValues.forEach((status) => {
        tasks.forEach((task) => {
          expect(() => {
            deriveTaskDueKind(task.dueDate, status, referenceDate);
          }).not.toThrow();

          expect(() => {
            isTaskOverdue(task.dueDate, status, referenceDate);
          }).not.toThrow();
        });
      });
    });

    it("handles leap year dates", () => {
      const leapYearDate = "2024-02-29";
      const referenceDate = new Date("2024-02-29T00:00:00Z");

      const resultOverdue = deriveTaskDueKind(
        leapYearDate,
        "pending",
        referenceDate
      );
      const resultDueToday = deriveTaskDueKind(
        leapYearDate,
        "pending",
        referenceDate
      );

      expect(resultOverdue).toBe("dueToday");
      expect(resultDueToday).toBe("dueToday");
    });
  });
});
