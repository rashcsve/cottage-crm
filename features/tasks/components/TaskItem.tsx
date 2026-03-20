import { Task } from "@/features/tasks/types/task.types";
import { TaskActions } from "./TaskActions";
import { TaskDueDate } from "./TaskDueDate";
import { TaskMeta } from "./TaskMeta";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
}

function StatusIcon({ done }: { done: boolean }) {
  if (done) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-5 w-5"
        >
          <path
            d="M5 10.5L8.5 14L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white" />
  );
}

export function TaskItem({ task, canManageTasks }: TaskItemProps) {
  const isDone = task.status === "done";

  return (
    <li className="group border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="shrink-0 pt-0.5">
          <StatusIcon done={isDone} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3
                className={`text-sm font-semibold ${
                  isDone ? "text-stone-500 line-through" : "text-stone-900"
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {task.description}
                </p>
              )}

              <TaskMeta task={task} />
            </div>

            <div className="flex items-center gap-2 self-start">
              <TaskDueDate dueDate={task.dueDate} status={task.status} />
              <TaskActions task={task} canManageTasks={canManageTasks} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

