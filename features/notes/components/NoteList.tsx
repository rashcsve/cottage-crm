"use client";

import { useTranslations } from "next-intl";
import type { Note } from "@/features/notes/types/notes";
import { NoteItem } from "@/features/notes/components/NoteItem";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList } from "@/shared/ui/RowList";

interface NoteListProps {
  notes: Note[];
  onDelete: (note: Note) => void;
  canManageNotes: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function NoteList({
  notes,
  onDelete,
  canManageNotes,
  emptyTitle,
  emptyDescription,
}: NoteListProps) {
  const tEmpty = useTranslations("notes.empty");
  const finalEmptyTitle = emptyTitle ?? tEmpty("noNotes");
  const finalEmptyDescription =
    emptyDescription ?? tEmpty("noNotesDescription");

  const isEmpty = notes.length === 0;

  return (
    <>
      <span className="sr-only" role="status">
        {isEmpty ? finalEmptyTitle : ""}
      </span>
      {isEmpty ? (
        <EmptyState
          title={finalEmptyTitle}
          description={finalEmptyDescription}
        />
      ) : (
        <RowList>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              canManageNotes={canManageNotes}
              onDelete={onDelete}
            />
          ))}
        </RowList>
      )}
    </>
  );
}
