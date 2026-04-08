"use client";

import { NoteActions } from "@/features/notes/components/NoteActions";
import type { Note } from "../types/notes";

interface NoteItemProps {
  note: Note;
  canManageNotes: boolean;
  onDelete: (note: Note) => void;
  currentUserId: string;
}

export function NoteItem({
  note,
  canManageNotes,
  onDelete,
  currentUserId,
}: NoteItemProps) {
  return (
    <li className="group border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="whitespace-pre-wrap text-sm font-semibold text-stone-900">
                {note.content}
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                <span>{note.author}</span>
                <span>•</span>
                <time dateTime={note.created_at}>
                  {new Date(note.created_at).toLocaleDateString("cs-CZ")}
                </time>
              </div>
            </div>

            <div className="flex items-start self-start">
              <NoteActions
                note={note}
                canManageNotes={canManageNotes}
                onDelete={onDelete}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
