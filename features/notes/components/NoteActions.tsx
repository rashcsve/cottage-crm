import { Trash2 } from "lucide-react";
import type { Note } from "@/features/notes/types/notes";
import { IconButton } from "@/shared/ui/IconButton";

interface NoteActionsProps {
  note: Note;
  canDelete: boolean;
  onDelete: (note: Note) => void;
  deleteAriaLabel: string;
}

export function NoteActions({
  note,
  canDelete,
  onDelete,
  deleteAriaLabel,
}: NoteActionsProps) {
  if (!canDelete) return null;

  return (
    <IconButton
      type="button"
      onClick={() => onDelete(note)}
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}
