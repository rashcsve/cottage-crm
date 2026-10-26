import { Trash2 } from "lucide-react";
import { IconButton } from "@/shared/ui/IconButton";

interface TaskActionsProps {
  deleteAriaLabel: string;
  onDelete: () => void;
}

export function TaskActions({ deleteAriaLabel, onDelete }: TaskActionsProps) {
  return (
    <IconButton type="button" onClick={onDelete} aria-label={deleteAriaLabel}>
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}
