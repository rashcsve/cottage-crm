import type { Task, TaskUrgencyGroups } from "@/features/tasks/types/tasks";

function compareDueDateAsc(a: Task, b: Task): number {
  return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
}

function compareCreatedAtDesc(a: Task, b: Task): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function groupOpenTasksByUrgency(tasks: Task[]): TaskUrgencyGroups {
  const pendingTasks = tasks.filter((task) => task.status === "pending");

  const needsAttention = pendingTasks
    .filter((task) => task.dueKind === "overdue")
    .sort(compareDueDateAsc);
  const today = pendingTasks
    .filter((task) => task.dueKind === "dueToday")
    .sort(compareCreatedAtDesc);
  const later = pendingTasks.filter(
    (task) => task.dueKind !== "overdue" && task.dueKind !== "dueToday",
  );
  const laterDated = later
    .filter((task) => task.dueDate !== null)
    .sort(compareDueDateAsc);
  const laterUndated = later
    .filter((task) => task.dueDate === null)
    .sort(compareCreatedAtDesc);

  return {
    needsAttention,
    today,
    later: [...laterDated, ...laterUndated],
  };
}
