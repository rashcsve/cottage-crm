import { deriveTaskDueKind } from "@/features/tasks/domain/predicates";
import type { Task, TaskPerson } from "@/features/tasks/types/tasks";
import type { TaskRow } from "@/features/tasks/server/mappers";

export const REFERENCE_DATE = "2026-04-07";
export const PAST_DATE = "2026-04-06";
export const FUTURE_DATE = "2027-04-08";

export const mockAuthor: TaskPerson = {
  displayName: "Alice Johnson",
};

export const mockAssignee: TaskPerson = {
  displayName: "Bob Smith",
};

export const mockAuthorRow = {
  display_name: "Alice Johnson",
};

export const mockAssigneeRow = {
  display_name: "Bob Smith",
};

export function createTask(overrides: Partial<Task> = {}): Task {
  const dueDate = overrides.dueDate ?? FUTURE_DATE;
  const status = overrides.status ?? "pending";
  const referenceDate = new Date(`${REFERENCE_DATE}T00:00:00Z`);

  return {
    id: 1,
    title: "Test Task",
    description: null,
    status,
    priority: "medium",
    dueDate,
    dueKind:
      overrides.dueKind !== undefined
        ? overrides.dueKind
        : deriveTaskDueKind(dueDate, status, referenceDate),
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    completedAt: null,
    author: mockAuthor,
    assignee: mockAssignee,
    authorId: "user-1",
    ...overrides,
  };
}

export function createTaskRow(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: 1,
    title: "Sample task",
    description: "Sample description",
    status: "pending",
    priority: "medium",
    author_id: "author-uuid-1",
    assignee_id: "assignee-uuid-2",
    due_date: FUTURE_DATE,
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
    completed_at: null,
    author: mockAuthorRow,
    assignee: mockAssigneeRow,
    ...overrides,
  };
}

export function createOverdueTask(overrides: Partial<Task> = {}): Task {
  return createTask({
    id: 101,
    title: "Overdue task",
    dueDate: PAST_DATE,
    status: "pending",
    ...overrides,
  });
}

export function createDueTodayTask(
  overrides: Partial<Task> = {},
  referenceDate: string = REFERENCE_DATE
): Task {
  return createTask({
    id: 102,
    title: "Due today task",
    dueDate: referenceDate,
    status: "pending",
    ...overrides,
  });
}

export function createFutureTask(overrides: Partial<Task> = {}): Task {
  return createTask({
    id: 103,
    title: "Future task",
    dueDate: FUTURE_DATE,
    status: "pending",
    ...overrides,
  });
}

export function createCompletedTask(overrides: Partial<Task> = {}): Task {
  return createTask({
    id: 104,
    title: "Completed task",
    status: "done",
    completedAt: "2026-04-07T12:00:00.000Z",
    ...overrides,
  });
}

export function createTaskWithoutDueDate(overrides: Partial<Task> = {}): Task {
  return createTask({
    id: 105,
    title: "Task without due date",
    dueDate: null,
    ...overrides,
  });
}

export function createOverdueTaskRow(
  overrides: Partial<TaskRow> = {}
): TaskRow {
  return createTaskRow({
    id: 201,
    title: "Overdue task row",
    due_date: PAST_DATE,
    status: "pending",
    ...overrides,
  });
}

export function createCompletedTaskRow(
  overrides: Partial<TaskRow> = {}
): TaskRow {
  return createTaskRow({
    id: 202,
    title: "Completed task row",
    status: "done",
    completed_at: "2026-04-07T12:00:00.000Z",
    ...overrides,
  });
}

export function createTaskList(count = 5): Task[] {
  return Array.from({ length: count }, (_, index) =>
    createTask({
      id: index + 1,
      title: `Task ${index + 1}`,
      status: index % 2 === 0 ? "pending" : "done",
      dueDate: index % 2 === 0 ? FUTURE_DATE : null,
      completedAt:
        index % 2 === 0
          ? null
          : `2026-04-0${Math.min(index + 1, 9)}T12:00:00.000Z`,
    })
  );
}
