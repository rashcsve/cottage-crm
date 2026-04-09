"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import type { Note } from "@/features/notes/types/notes";

interface NoteActionsProps {
  note: Note;
  canManageNotes: boolean;
  onDelete: (note: Note) => void;
}

export function NoteActions({
  note,
  canManageNotes,
  onDelete,
}: NoteActionsProps) {
  const t = useTranslations("notes.aria");

  if (!canManageNotes) return null;

  return (
    <button
      type="button"
      onClick={() => onDelete(note)}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={t("deleteNote")}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
