import { Task } from "@/features/tasks/types/task.types";
import { TaskPriorityBadge } from "./TaskPriorityBadge";

interface TaskMetaProps {
  task: Task;
}

export function TaskMeta({ task }: TaskMetaProps) {
  const assigneeName =
    task.assignee?.displayName ?? task.author?.displayName ?? "Bez přiřazení";

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
        {assigneeName}
      </span>

      <TaskPriorityBadge priority={task.priority} />

      {task.category && (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
          {task.category}
        </span>
      )}
    </div>
  );
}

