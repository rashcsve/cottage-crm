"use client";

import type { Task } from "@/features/tasks/types/tasks";
import { TaskItem } from "@/features/tasks/components/TaskItem";
import { useTranslations } from "next-intl";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import { EmptyState } from "@/shared/ui/EmptyState";

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
      retry: tDelete("retry"),
    },
    onCommitSuccess: () => {
      router.refresh();
    },
  });

  const isEmpty = tasks.length === 0;

  return (
    <>
      <span className="sr-only" role="status">
        {isEmpty ? finalEmptyTitle : ""}
      </span>
      {isEmpty ? (
        <EmptyState
          title={finalEmptyTitle}
          description={finalEmptyDescription}
        />
      ) : (
        <ul className="space-y-2">
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
      )}
    </>
  );
}
