"use client";

import { useLocale, useTranslations } from "next-intl";
import { NoteActions } from "@/features/notes/components/NoteActions";
import { NotePhotoGallery } from "@/features/notes/components/NotePhotoGallery";
import { formatNoteTimestamp } from "@/features/notes/shared/formatNoteDate";
import type { Note } from "@/features/notes/types/notes";

interface NoteItemProps {
  note: Note;
  canManageNotes: boolean;
  onDelete: (note: Note) => void;
}

export function NoteItem({ note, canManageNotes, onDelete }: NoteItemProps) {
  const locale = useLocale();
  const tAria = useTranslations("notes.aria");
  const tItem = useTranslations("notes.item");
  const createdAtLabel = formatNoteTimestamp(note.createdAt, locale);

  return (
    <li
      id={`note-${note.id}`}
      className="group scroll-mt-24 border-b border-stone-200 last:border-b-0"
    >
      <article className="flex items-start gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-[11px] font-medium text-stone-500">
                  {tItem("addedBy", { name: note.author })}
                </span>

                <time
                  dateTime={note.createdAt}
                  className="text-[11px] text-stone-400"
                >
                  {createdAtLabel}
                </time>
              </div>

              <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-stone-900">
                {note.content}
              </p>

              {note.photos.length > 0 ? (
                <NotePhotoGallery
                  authorName={note.author}
                  photos={note.photos}
                />
              ) : null}
            </div>

            <div className="ml-auto flex shrink-0 items-start self-start pt-0.5">
              <NoteActions
                note={note}
                canDelete={canManageNotes}
                onDelete={onDelete}
                deleteAriaLabel={tAria("deleteNoteFrom", {
                  author: note.author,
                })}
              />
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
