"use client";

import { Task } from "@/features/tasks/types/tasks";
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
}

export function TaskList({
  initialTasks,
  canManageTasks,
  emptyTitle,
  emptyDescription,
  currentUserId,
}: TaskListProps) {
  const tEmpty = useTranslations("tasks.empty");
  const tDelete = useTranslations("tasks.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const finalEmptyTitle = emptyTitle || tEmpty("noTasks");
  const finalEmptyDescription =
    emptyDescription || tEmpty("noTasksDescription");

  const { items: tasks, removeItem: handleDelete } = useOptimisticRemoveList({
    items: initialTasks,
    commitRemove: async (task) => deleteTaskAction({ taskId: task.id }),
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
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
        <h3 className="text-sm font-semibold text-stone-900">
          {finalEmptyTitle}
        </h3>
        <p className="mt-1 text-sm text-stone-600">{finalEmptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
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
