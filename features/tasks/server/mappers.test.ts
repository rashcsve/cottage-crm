import { describe, it, expect } from "vitest";
import { mapTaskRowToTask } from "@/features/tasks/server/mappers";
import {
  createTaskRow,
  createOverdueTaskRow,
  createCompletedTaskRow,
  mockAuthorRow,
  mockAssigneeRow,
} from "@/tests/fixtures/task-fixtures";
import { TaskPriority, TaskStatus } from "../types/task.types";

type TaskRowInput = Parameters<typeof mapTaskRowToTask>[0];

function createInvalidTaskRow(
  overrides: Partial<Record<keyof TaskRowInput, unknown>>
): TaskRowInput {
  return {
    ...createTaskRow(),
    ...overrides,
  } as unknown as TaskRowInput;
}

describe("features/tasks/server/mappers", () => {
  describe("mapTaskRowToTask", () => {
    it("maps basic task row to task", () => {
      const row = createTaskRow();

      const result = mapTaskRowToTask(row);

      expect(result.id).toBe(row.id);
      expect(result.title).toBe(row.title);
      expect(result.description).toBe(row.description);
      expect(result.status).toBe(row.status);
      expect(result.priority).toBe(row.priority);
      expect(result.dueDate).toBe(row.due_date);
      expect(result.createdAt).toBe(row.created_at);
      expect(result.updatedAt).toBe(row.updated_at);
      expect(result.completedAt).toBeNull();
    });

    it("defaults priority to medium when null", () => {
      const row = createTaskRow({ priority: null });

      const result = mapTaskRowToTask(row);

      expect(result.priority).toBe("medium");
    });

    it("extracts person from object format", () => {
      const row = createTaskRow({
        author: mockAuthorRow,
        assignee: mockAssigneeRow,
      });

      const result = mapTaskRowToTask(row);

      expect(result.author).toEqual({
        displayName: mockAuthorRow.display_name,
      });
      expect(result.assignee).toEqual({
        displayName: mockAssigneeRow.display_name,
      });
    });

    it("extracts person from array format (Supabase relation)", () => {
      const row = createTaskRow({
        author: [mockAuthorRow],
        assignee: [mockAssigneeRow],
      });

      const result = mapTaskRowToTask(row);

      expect(result.author).toEqual({
        displayName: mockAuthorRow.display_name,
      });
      expect(result.assignee).toEqual({
        displayName: mockAssigneeRow.display_name,
      });
    });

    it("handles null author and assignee", () => {
      const row = createTaskRow({
        author: null,
        assignee: null,
      });

      const result = mapTaskRowToTask(row);

      expect(result.author).toBeNull();
      expect(result.assignee).toBeNull();
    });

    it("handles null display_name in person object", () => {
      const row = createTaskRow({
        author: { display_name: null },
        assignee: { display_name: null },
      });

      const result = mapTaskRowToTask(row);

      expect(result.author).toBeNull();
      expect(result.assignee).toBeNull();
    });

    it("handles done task with completed_at timestamp", () => {
      const row = createCompletedTaskRow();

      const result = mapTaskRowToTask(row);

      expect(result.status).toBe("done");
      expect(result.completedAt).toBe(row.completed_at);
    });

    it("converts snake_case to camelCase", () => {
      const row = createTaskRow();

      const result = mapTaskRowToTask(row);

      expect(result).not.toHaveProperty("due_date");
      expect(result).not.toHaveProperty("created_at");
      expect(result).not.toHaveProperty("updated_at");
      expect(result).not.toHaveProperty("completed_at");
      expect(result).toHaveProperty("dueDate");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
      expect(result).toHaveProperty("completedAt");
    });

    it("throws error when id is missing", () => {
      const row = createInvalidTaskRow({ id: null });

      expect(() => mapTaskRowToTask(row)).toThrow(
        "Invalid TaskRow: missing required fields"
      );
    });

    it("throws error when title is missing", () => {
      const row = createInvalidTaskRow({ title: null });

      expect(() => mapTaskRowToTask(row)).toThrow(
        "Invalid TaskRow: missing required fields"
      );
    });

    it("preserves all priority levels", () => {
      const priorities: TaskPriority[] = ["low", "medium", "high"];

      priorities.forEach((priority) => {
        const row = createTaskRow({ priority });

        const result = mapTaskRowToTask(row);

        expect(result.priority).toBe(priority);
      });
    });

    it("preserves all status values", () => {
      const statuses: TaskStatus[] = ["pending", "done"];

      statuses.forEach((status) => {
        const row = createTaskRow({ status });

        const result = mapTaskRowToTask(row);

        expect(result.status).toBe(status);
      });
    });

    it("maps overdue task row", () => {
      const row = createOverdueTaskRow();

      const result = mapTaskRowToTask(row);

      expect(result.status).toBe("pending");
      expect(result.dueDate).toBe(row.due_date);
    });
  });
});
