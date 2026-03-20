import {
  deleteTaskAction,
  toggleTaskAction,
} from "@/features/tasks/server/actions";
import { Task, TaskStatus } from "@/features/tasks/types/task.types";

interface TaskActionsProps {
  task: Task;
  canManageTasks: boolean;
}

function ToggleIcon({ status }: { status: TaskStatus }) {
  // done -> reopen, pending -> mark done
  return status === "done" ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M4.5 10a5.5 5.5 0 1 0 1.6-3.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.8 5.7h3.7v3.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M4 10.5 8.2 14 16 6.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M7 5h6m-8 2h10m-9 0 1 11h6l1-11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskActions({ task, canManageTasks }: TaskActionsProps) {
  if (!canManageTasks) return null;

  return (
    <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
      <form action={toggleTaskAction}>
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="currentStatus" value={task.status} />
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
          aria-label={
            task.status === "done"
              ? `Znovu otevřít úkol ${task.title}`
              : `Označit úkol ${task.title} jako hotový`
          }
        >
          <ToggleIcon status={task.status} />
        </button>
      </form>

      <form action={deleteTaskAction}>
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
          aria-label={`Smazat úkol ${task.title}`}
        >
          <TrashIcon />
        </button>
      </form>
    </div>
  );
}

