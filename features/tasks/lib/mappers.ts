import { Task, TaskRow, TaskPriority } from "@/features/tasks/types/task.types";

export function mapTaskRowToTask(task: TaskRow): Task {
  const authorDisplayName = Array.isArray(task.author)
    ? task.author[0]?.display_name ?? null
    : task.author?.display_name ?? null;

  const assigneeDisplayName = Array.isArray(task.assignee)
    ? task.assignee[0]?.display_name ?? null
    : task.assignee?.display_name ?? null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: (task.priority ?? "medium") as TaskPriority,
    category: task.category,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    completedAt: task.completed_at,
    author:
      authorDisplayName !== null ? { displayName: authorDisplayName } : null,
    assignee:
      assigneeDisplayName !== null
        ? { displayName: assigneeDisplayName }
        : null,
  };
}

