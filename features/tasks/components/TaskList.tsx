"use client";

import { Task } from "@/features/tasks/types/task.types";
import { TaskItem } from "@/features/tasks/components/TaskItem";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/shared/Toast/useToast";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useRouter } from "@/i18n/navigation";

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
  const { showToast, dismissToast, info, error } = useToast();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const pendingDeleteTimersRef = useRef<Map<Task["id"], number>>(new Map());

  const finalEmptyTitle = emptyTitle || tEmpty("noTasks");
  const finalEmptyDescription =
    emptyDescription || tEmpty("noTasksDescription");

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const clearPendingDeleteTimer = useCallback((taskId: Task["id"]) => {
    const timerId = pendingDeleteTimersRef.current.get(taskId);

    if (timerId === undefined) {
      return;
    }

    clearTimeout(timerId);
    pendingDeleteTimersRef.current.delete(taskId);
  }, []);

  const restoreTask = useCallback(
    (task: Task) => {
      setTasks((prev) => {
        if (prev.some((item) => item.id === task.id)) {
          return prev;
        }

        const originalIndex = initialTasks.findIndex(
          (item) => item.id === task.id
        );

        if (originalIndex < 0 || originalIndex > prev.length) {
          return [...prev, task];
        }

        const nextTasks = [...prev];
        nextTasks.splice(originalIndex, 0, task);

        return nextTasks;
      });
    },
    [initialTasks]
  );

  const commitDelete = useCallback(
    async (task: Task, toastId: string) => {
      try {
        const result = await deleteTaskAction({ taskId: task.id });

        dismissToast(toastId);

        if (!result.ok) {
          restoreTask(task);
          error(result.error || tCommon("error"));
          return;
        }

        router.refresh();
      } catch (err) {
        dismissToast(toastId);

        restoreTask(task);

        const message = err instanceof Error ? err.message : tCommon("error");

        error(message);
      } finally {
        clearPendingDeleteTimer(task.id);
      }
    },
    [dismissToast, restoreTask, error, router, tCommon, clearPendingDeleteTimer]
  );

  const handleDelete = useCallback(
    (task: Task) => {
      if (pendingDeleteTimersRef.current.has(task.id)) {
        return;
      }

      setTasks((prev) => prev.filter((item) => item.id !== task.id));

      let toastId = "";

      const handleUndo = () => {
        clearPendingDeleteTimer(task.id);
        dismissToast(toastId);
        restoreTask(task);
        info(tDelete("restored"));
      };

      toastId = showToast(tDelete("success"), {
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: { label: tDelete("undo"), onClick: handleUndo },
      });

      const timerId = window.setTimeout(() => {
        void commitDelete(task, toastId);
      }, TOAST_UNDO_WINDOW_MS);

      pendingDeleteTimersRef.current.set(task.id, timerId);
    },
    [
      commitDelete,
      dismissToast,
      info,
      restoreTask,
      showToast,
      tDelete,
      clearPendingDeleteTimer,
    ]
  );

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
