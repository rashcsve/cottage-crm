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
      className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-stone-400 opacity-70 transition hover:bg-stone-100 hover:text-stone-700 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
