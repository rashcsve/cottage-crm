import { Trash2 } from "lucide-react";
import type { Task } from "@/features/tasks/types/tasks";

interface TaskActionsProps {
  task: Task;
  canDelete: boolean;
  onDelete: (task: Task) => void;
  deleteAriaLabel: string;
}

export function TaskActions({
  task,
  canDelete,
  onDelete,
  deleteAriaLabel,
}: TaskActionsProps) {
  if (!canDelete) return null;

  return (
    <button
      type="button"
      onClick={() => onDelete(task)}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
