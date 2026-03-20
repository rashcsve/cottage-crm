import { getTaskPriorityLabel } from "@/features/tasks/lib/utils";
import { TaskPriority } from "@/features/tasks/types/task.types";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const className =
    priority === "high"
      ? "border-red-200 bg-red-50 text-red-700"
      : priority === "low"
      ? "border-stone-200 bg-stone-50 text-stone-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {getTaskPriorityLabel(priority)}
    </span>
  );
}

