"use client";

import { useTranslations } from "next-intl";
import type { Note } from "@/features/notes/types/notes";
import { NoteItem } from "@/features/notes/components/NoteItem";
import { deleteNoteAction } from "@/features/notes/server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";

interface NoteListProps {
  notes: Note[];
  canManageNotes: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

export function NoteList({
  notes,
  canManageNotes,
  emptyTitle,
  emptyDescription,
}: NoteListProps) {
  const tDelete = useTranslations("notes.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { items: displayNotes, removeItem: handleDelete } =
    useOptimisticRemoveList({
      items: notes,
      commitRemove: async (note) => deleteNoteAction(note.id),
      messages: {
        success: tDelete("success"),
        restored: tDelete("restored"),
        undo: tDelete("undo"),
        fallbackError: tCommon("error"),
      },
      onCommitSuccess: () => {
        router.refresh();
      },
    });

  if (displayNotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
        <h3 className="text-sm font-semibold text-stone-900">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-stone-600">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {displayNotes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          canManageNotes={canManageNotes}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
