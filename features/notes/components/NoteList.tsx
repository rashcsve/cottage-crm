"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Note } from "@/features/notes/types/notes";
import { NoteItem } from "@/features/notes/components/NoteItem";
import { deleteNoteAction } from "@/features/notes/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";

interface NoteListProps {
  notes: Note[];
  canManageNotes: boolean;
  currentUserId: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function NoteList({
  notes,
  canManageNotes,
  currentUserId,
  emptyTitle,
  emptyDescription,
}: NoteListProps) {
  const tDelete = useTranslations("notes.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { showToast, dismissToast, info, error } = useToast();

  const [displayNotes, setDisplayNotes] = useState<Note[]>(notes);
  const pendingDeleteTimersRef = useRef<Map<Note["id"], number>>(new Map());

  useEffect(() => {
    setDisplayNotes(notes);
  }, [notes]);

  const clearPendingDeleteTimer = useCallback((noteId: Note["id"]) => {
    const timerId = pendingDeleteTimersRef.current.get(noteId);

    if (timerId === undefined) {
      return;
    }

    clearTimeout(timerId);
    pendingDeleteTimersRef.current.delete(noteId);
  }, []);

  const restoreNote = useCallback(
    (note: Note) => {
      setDisplayNotes((prev) => {
        if (prev.some((item) => item.id === note.id)) {
          return prev;
        }

        const originalIndex = notes.findIndex((item) => item.id === note.id);

        if (originalIndex < 0 || originalIndex > prev.length) {
          return [...prev, note];
        }

        const nextNotes = [...prev];
        nextNotes.splice(originalIndex, 0, note);

        return nextNotes;
      });
    },
    [notes]
  );

  const commitDelete = useCallback(
    async (note: Note, toastId: string) => {
      try {
        const result = await deleteNoteAction(note.id);

        dismissToast(toastId);

        if (!result.ok) {
          restoreNote(note);
          error(result.error || tCommon("error"));
          return;
        }

        router.refresh();
      } catch (err) {
        dismissToast(toastId);
        restoreNote(note);

        const message = err instanceof Error ? err.message : tCommon("error");
        error(message);
      } finally {
        clearPendingDeleteTimer(note.id);
      }
    },
    [dismissToast, restoreNote, error, router, tCommon, clearPendingDeleteTimer]
  );

  const handleDelete = useCallback(
    (note: Note) => {
      if (pendingDeleteTimersRef.current.has(note.id)) {
        return;
      }

      setDisplayNotes((prev) => prev.filter((item) => item.id !== note.id));

      let toastId = "";

      const handleUndo = () => {
        clearPendingDeleteTimer(note.id);
        dismissToast(toastId);
        restoreNote(note);
        info(tDelete("restored"));
      };

      toastId = showToast(tDelete("success"), {
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: { label: tDelete("undo"), onClick: handleUndo },
      });

      const timerId = window.setTimeout(() => {
        void commitDelete(note, toastId);
      }, TOAST_UNDO_WINDOW_MS);

      pendingDeleteTimersRef.current.set(note.id, timerId);
    },
    [
      commitDelete,
      dismissToast,
      info,
      restoreNote,
      showToast,
      tDelete,
      clearPendingDeleteTimer,
    ]
  );

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
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
