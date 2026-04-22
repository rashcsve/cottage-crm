"use client";

import type { Task } from "@/features/tasks/types/tasks";
import { TaskItem } from "@/features/tasks/components/TaskItem";
import { useTranslations } from "next-intl";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";

interface TaskListProps {
  initialTasks: Task[];
  canManageTasks: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  currentUserId: string;
  variant?: "card" | "plain";
}

export function TaskList({
  initialTasks,
  canManageTasks,
  emptyTitle,
  emptyDescription,
  currentUserId,
  variant = "card",
}: TaskListProps) {
  const tEmpty = useTranslations("tasks.empty");
  const tDelete = useTranslations("tasks.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const finalEmptyTitle = emptyTitle ?? tEmpty("noTasks");
  const finalEmptyDescription =
    emptyDescription ?? tEmpty("noTasksDescription");

  const { items: tasks, removeItem: handleDelete } = useOptimisticRemoveList({
    items: initialTasks,
    commitRemove: (task) => deleteTaskAction({ taskId: task.id }),
    messages: {
      success: tDelete("success"),
      restored: tDelete("restored"),
      undo: tDelete("undo"),
      fallbackError: tCommon("error"),
    },
    onCommitSuccess: () => {
      router.refresh();
    },
  });

  if (tasks.length === 0) {
    const emptyStateClassName =
      variant === "plain"
        ? "rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center"
        : "rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center";

    return (
      <div className={emptyStateClassName}>
        <p className="text-sm font-semibold text-stone-900">
          {finalEmptyTitle}
        </p>
        <p className="mt-1 text-sm text-stone-600">{finalEmptyDescription}</p>
      </div>
    );
  }

  const listClassName =
    variant === "plain" ? "space-y-2.5 sm:space-y-3" : "space-y-2.5 sm:space-y-3";

  return (
    <ul className={listClassName}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          canManageTasks={canManageTasks}
          onDelete={handleDelete}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
