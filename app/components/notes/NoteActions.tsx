"use client";

import { deleteNoteAction } from "@/components/notes/actions";

type NoteActionsProps = {
  noteId: number;
};

export function NoteActions({ noteId }: NoteActionsProps) {
  return (
    <form action={deleteNoteAction.bind(null, noteId)}>
      <button
        type="submit"
        className="text-sm font-medium text-red-700 transition hover:text-red-800"
      >
        Smazat
      </button>
    </form>
  );
}
