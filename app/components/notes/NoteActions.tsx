"use client";

import { deleteNoteAction } from "@/components/notes/actions";
import { ActionButton } from "@/components/ui/ActionsButton";

interface NoteActionsProps {
  noteId: number;
}

export function NoteActions({ noteId }: NoteActionsProps) {
  return (
    <form action={deleteNoteAction.bind(null, noteId)}>
      <ActionButton variant="danger">Smazat</ActionButton>
    </form>
  );
}
