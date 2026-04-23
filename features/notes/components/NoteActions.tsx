import { Trash2 } from "lucide-react";
import type { Note } from "@/features/notes/types/notes";

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
    <button
      type="button"
      onClick={() => onDelete(note)}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
