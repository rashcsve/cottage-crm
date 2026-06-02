import { Trash2 } from "lucide-react";
import type { Task } from "@/features/tasks/types/tasks";
import { IconButton } from "@/shared/ui/IconButton";

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
    <IconButton
      type="button"
      onClick={() => onDelete(task)}
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}
