"use client";

import { useLocale, useTranslations } from "next-intl";
import { NoteActions } from "@/features/notes/components/NoteActions";
import { NotePhotoGallery } from "@/features/notes/components/NotePhotoGallery";
import type { Note } from "@/features/notes/types/notes";
import { RelativeTime } from "@/shared/ui/ItemByline";
import { RowListItem } from "@/shared/ui/RowList";

interface NoteItemProps {
  note: Note;
  canManageNotes: boolean;
  onDelete: (note: Note) => void;
}

export function NoteItem({ note, canManageNotes, onDelete }: NoteItemProps) {
  const locale = useLocale();
  const tAria = useTranslations("notes.aria");
  const tItem = useTranslations("notes.item");

  return (
    <RowListItem
      id={`note-${note.id}`}
      className="group scroll-mt-24 items-start"
    >
      <article className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 md:grid-cols-[150px_minmax(0,1fr)_auto] md:gap-x-6">
        <p className="min-w-0 font-bold text-ink-primary">
          <span className="sr-only">
            {tItem("addedBy", { name: note.author })}
          </span>
          <span aria-hidden="true">{note.author}</span>
        </p>

        <span className="col-start-2 row-start-1 whitespace-nowrap pt-0.5 text-xs text-ink-muted md:col-start-3">
          <RelativeTime dateTime={note.createdAt} locale={locale} />
        </span>

        <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
          <p className="whitespace-pre-wrap wrap-break-word text-sm text-ink-secondary">
            {note.content}
          </p>

          {note.photos.length > 0 ? (
            <NotePhotoGallery authorName={note.author} photos={note.photos} />
          ) : null}
        </div>
      </article>

      {canManageNotes ? (
        <div className="-my-1.5 shrink-0 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100">
          <NoteActions
            note={note}
            canDelete={canManageNotes}
            onDelete={onDelete}
            deleteAriaLabel={tAria("deleteNoteFrom", {
              author: note.author,
            })}
          />
        </div>
      ) : null}
    </RowListItem>
  );
}
