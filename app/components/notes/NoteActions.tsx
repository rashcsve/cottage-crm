"use client";

import { deleteNoteAction } from "@/app/(dashboard)/notes/actions";
import { ActionButton } from "@/app/components/ui/ActionButton";

interface NoteActionsProps {
  noteId: number;
}

export function NoteActions({ noteId }: NoteActionsProps) {
  return (
    <form action={deleteNoteAction.bind(null, noteId)}>
      <ActionButton tone="danger">Smazat</ActionButton>
    </form>
  );
}
