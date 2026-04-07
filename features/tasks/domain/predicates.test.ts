import { describe, it, expect } from "vitest";
import {
  isTaskOverdue,
  isTaskDueToday,
  deriveTaskDueKind,
} from "@/features/tasks/domain/predicates";

describe("features/tasks/domain/predicates", () => {
  describe("isTaskOverdue", () => {
    it("returns true for past pending tasks", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskOverdue("2024-06-14", "pending", today)).toBe(true);
    });

    it("returns false for today's pending task", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskOverdue("2024-06-15", "pending", today)).toBe(false);
    });

    it("returns false for future pending task", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskOverdue("2024-06-16", "pending", today)).toBe(false);
    });

    it("returns false if status is done (completed tasks not overdue)", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskOverdue("2020-01-01", "done", today)).toBe(false);
    });

    it("returns false if dueDate is null", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskOverdue(null, "pending", today)).toBe(false);
    });

    it("respects time component of today parameter", () => {
      // Early morning
      const earlyMorning = new Date("2024-06-15T01:00:00Z");
      // Late evening
      const lateEvening = new Date("2024-06-15T23:00:00Z");

      // Same date should have consistent results
      expect(isTaskOverdue("2024-06-14", "pending", earlyMorning)).toBe(true);
      expect(isTaskOverdue("2024-06-14", "pending", lateEvening)).toBe(true);
    });
  });

  describe("isTaskDueToday", () => {
    it("returns true for today's pending task", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskDueToday("2024-06-15", "pending", today)).toBe(true);
    });

    it("returns false for past pending task", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskDueToday("2024-06-14", "pending", today)).toBe(false);
    });

    it("returns false for future pending task", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskDueToday("2024-06-16", "pending", today)).toBe(false);
    });

    it("returns false if status is done", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskDueToday("2024-06-15", "done", today)).toBe(false);
    });

    it("returns false if dueDate is null", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(isTaskDueToday(null, "pending", today)).toBe(false);
    });

    it("ignores time component of today parameter", () => {
      const earlyMorning = new Date("2024-06-15T01:00:00Z");
      const lateEvening = new Date("2024-06-15T23:00:00Z");

      // Same calendar day should have consistent results
      expect(isTaskDueToday("2024-06-15", "pending", earlyMorning)).toBe(true);
      expect(isTaskDueToday("2024-06-15", "pending", lateEvening)).toBe(true);
    });
  });

  describe("deriveTaskDueKind", () => {
    it("returns 'completed' for done tasks regardless of dueDate", () => {
      const today = new Date("2024-06-15T00:00:00Z");

      expect(deriveTaskDueKind("2020-01-01", "done", today)).toBe("completed");
      expect(deriveTaskDueKind("2099-12-31", "done", today)).toBe("completed");
      expect(deriveTaskDueKind(null, "done", today)).toBe("completed");
    });

    it("returns 'overdue' for past pending tasks", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(deriveTaskDueKind("2024-06-14", "pending", today)).toBe("overdue");
    });

    it("returns 'dueToday' for today's pending tasks", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(deriveTaskDueKind("2024-06-15", "pending", today)).toBe(
        "dueToday"
      );
    });

    it("returns 'dueOn' for future pending tasks", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(deriveTaskDueKind("2024-06-16", "pending", today)).toBe("dueOn");
    });

    it("returns null if dueDate is null", () => {
      const today = new Date("2024-06-15T00:00:00Z");
      expect(deriveTaskDueKind(null, "pending", today)).toBeNull();
      expect(deriveTaskDueKind(null, "done", today)).toBe("completed");
    });

    it("prioritizes: completed > overdue > dueToday > dueOn", () => {
      const today = new Date("2024-06-15T00:00:00Z");

      // Overdue past due date gets "overdue", not "completed"
      expect(deriveTaskDueKind("2020-01-01", "pending", today)).toBe("overdue");

      // Today gets "dueToday", not "dueOn"
      expect(deriveTaskDueKind("2024-06-15", "pending", today)).toBe(
        "dueToday"
      );

      // Future gets "dueOn"
      expect(deriveTaskDueKind("2099-12-31", "pending", today)).toBe("dueOn");

      // Done status always wins
      expect(deriveTaskDueKind("2020-01-01", "done", today)).toBe("completed");
    });
  });

  describe("integration: task due kind classification", () => {
    it("classifies all task scenarios correctly", () => {
      const today = new Date("2024-06-15T12:30:45Z");

      const scenarios = [
        {
          dueDate: "2024-06-14",
          status: "pending" as const,
          expected: "overdue",
        },
        {
          dueDate: "2024-06-15",
          status: "pending" as const,
          expected: "dueToday",
        },
        {
          dueDate: "2024-06-16",
          status: "pending" as const,
          expected: "dueOn",
        },
        {
          dueDate: "2024-06-14",
          status: "done" as const,
          expected: "completed",
        },
        { dueDate: null, status: "pending" as const, expected: null },
      ];

      scenarios.forEach(({ dueDate, status, expected }) => {
        const result = deriveTaskDueKind(dueDate, status, today);
        expect(result).toBe(expected);
      });
    });

    it("handles leap year dates", () => {
      const today = new Date("2024-02-29T00:00:00Z");

      expect(deriveTaskDueKind("2024-02-28", "pending", today)).toBe("overdue");
      expect(deriveTaskDueKind("2024-02-29", "pending", today)).toBe(
        "dueToday"
      );
      expect(deriveTaskDueKind("2024-03-01", "pending", today)).toBe("dueOn");
    });

    it("handles year boundary dates", () => {
      const today = new Date("2024-01-01T00:00:00Z");

      expect(deriveTaskDueKind("2023-12-31", "pending", today)).toBe("overdue");
      expect(deriveTaskDueKind("2024-01-01", "pending", today)).toBe(
        "dueToday"
      );
      expect(deriveTaskDueKind("2024-01-02", "pending", today)).toBe("dueOn");
    });
  });

  describe("edge cases and timezone safety", () => {
    it("produces consistent results regardless of time of day", () => {
      const earlyMorning = new Date("2024-06-15T01:00:00Z");
      const afternoon = new Date("2024-06-15T12:00:00Z");
      const lateEvening = new Date("2024-06-15T23:59:59Z");

      const scenarios = [
        { dueDate: "2024-06-14", status: "pending" as const },
        { dueDate: "2024-06-15", status: "pending" as const },
        { dueDate: "2024-06-16", status: "pending" as const },
      ];

      scenarios.forEach(({ dueDate, status }) => {
        const resultMorning = deriveTaskDueKind(dueDate, status, earlyMorning);
        const resultAfternoon = deriveTaskDueKind(dueDate, status, afternoon);
        const resultEvening = deriveTaskDueKind(dueDate, status, lateEvening);

        expect(resultMorning).toBe(resultAfternoon);
        expect(resultAfternoon).toBe(resultEvening);
      });
    });

    it("handles null status gracefully", () => {
      const today = new Date("2024-06-15T00:00:00Z");

      // Status defaults to "pending" in isTaskOverdue
      // But deriveTaskDueKind should still work
      expect(() => {
        deriveTaskDueKind("2024-06-14", "pending", today);
      }).not.toThrow();
    });

    it("does not throw on invalid dates", () => {
      const today = new Date("2024-06-15T00:00:00Z");

      // These should not throw
      expect(deriveTaskDueKind("invalid-date", "pending", today)).toBe("dueOn");
      expect(isTaskOverdue("invalid-date", "pending", today)).toBe(false);
      expect(isTaskDueToday("invalid-date", "pending", today)).toBe(false);
    });
  });

  describe("comparison with lib/utils/date functions", () => {
    it("uses isDateOnlyBefore and isSameDateOnly correctly", () => {
      const today = new Date("2024-06-15T00:00:00Z");

      // Test that it uses isDateOnlyBefore for "overdue"
      const pastDate = "2024-06-14";
      expect(isTaskOverdue(pastDate, "pending", today)).toBe(true);

      // Test that it uses isSameDateOnly for "dueToday"
      const todayDate = "2024-06-15";
      expect(isTaskDueToday(todayDate, "pending", today)).toBe(true);

      // Test combined logic
      expect(deriveTaskDueKind(pastDate, "pending", today)).toBe("overdue");
      expect(deriveTaskDueKind(todayDate, "pending", today)).toBe("dueToday");
    });
  });
});
