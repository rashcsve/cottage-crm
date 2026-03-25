import { getTranslations } from "next-intl/server";
import type { Task, TaskPriority } from "@/features/tasks/types/task.types";

interface TaskMetaProps {
  task: Task;
}

const PRIORITY_TONE_CLASS_NAMES: Record<TaskPriority, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-stone-200 bg-stone-50 text-stone-700",
};

const ASSIGNEE_BADGE_CLASS_NAME =
  "inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700";

const PRIORITY_BADGE_BASE_CLASS_NAME =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";

export async function TaskMeta({ task }: TaskMetaProps) {
  const tPriority = await getTranslations("tasks.priority");

  const assigneeName = task.assignee?.displayName ?? task.author?.displayName;

  return (
    <>
      {assigneeName && (
        <span className={ASSIGNEE_BADGE_CLASS_NAME}>{assigneeName}</span>
      )}

      <span
        className={`${PRIORITY_BADGE_BASE_CLASS_NAME} ${
          PRIORITY_TONE_CLASS_NAMES[task.priority]
        }`}
      >
        {tPriority(task.priority)}
      </span>
    </>
  );
}
