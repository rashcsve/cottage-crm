import { getTaskPriorityLabel } from "@/features/tasks/lib/utils";
import type { Task } from "@/features/tasks/types/task.types";

interface TaskMetaProps {
  task: Task;
}

function getPriorityTone(priority: Task["priority"]) {
  switch (priority) {
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "low":
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

const NEUTRAL_BADGE_CLASS_NAME =
  "inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700";

const PRIORITY_BADGE_BASE_CLASS_NAME =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";

export function TaskMeta({ task }: TaskMetaProps) {
  const assigneeName =
    task.assignee?.displayName ?? task.author?.displayName ?? "Bez přiřazení";

  return (
    <>
      <span className={NEUTRAL_BADGE_CLASS_NAME}>{assigneeName}</span>

      <span
        className={`${PRIORITY_BADGE_BASE_CLASS_NAME} ${getPriorityTone(
          task.priority
        )}`}
      >
        {getTaskPriorityLabel(task.priority)}
      </span>

      {task.category ? (
        <span className={NEUTRAL_BADGE_CLASS_NAME}>{task.category}</span>
      ) : null}
    </>
  );
}
