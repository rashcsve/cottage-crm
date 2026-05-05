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
  emptyTitle?: string;
  emptyDescription?: string;
  variant?: "card" | "plain";
}

export function NoteList({
  notes,
  canManageNotes,
  emptyTitle,
  emptyDescription,
  variant = "card",
}: NoteListProps) {
  const tEmpty = useTranslations("notes.empty");
  const tDelete = useTranslations("notes.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const finalEmptyTitle = emptyTitle ?? tEmpty("noNotes");
  const finalEmptyDescription =
    emptyDescription ?? tEmpty("noNotesDescription");
  const { items: displayNotes, removeItem: handleDelete } =
    useOptimisticRemoveList({
      items: notes,
      commitRemove: async (note) => deleteNoteAction({ noteId: note.id }),
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
    const emptyStateClassName =
      variant === "plain"
        ? "m-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center"
        : "rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center";

    return (
      <div className={emptyStateClassName}>
        <h3 className="text-sm font-semibold text-stone-900">
          {finalEmptyTitle}
        </h3>
        <p className="mt-1 text-sm text-stone-600">
          {finalEmptyDescription}
        </p>
      </div>
    );
  }

  return (
    <ul
      className={
        variant === "plain"
          ? "overflow-hidden"
          : "overflow-hidden rounded-2xl border border-stone-200 bg-white"
      }
    >
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
