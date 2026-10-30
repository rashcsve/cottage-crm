"use client";

import { useLocale, useTranslations } from "next-intl";
import { NoteActions } from "@/features/notes/components/NoteActions";
import { NoteContentDisclosure } from "@/features/notes/components/NoteContentDisclosure";
import { NotePhotoGallery } from "@/features/notes/components/NotePhotoGallery";
import type { Note } from "@/features/notes/types/notes";
import { AuthorInitial } from "@/shared/ui/AuthorInitial";
import { ItemByline } from "@/shared/ui/ItemByline";
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
  const author = note.author.trim();

  return (
    <RowListItem
      id={`note-${note.id}`}
      className="group scroll-mt-24 items-start"
    >
      <AuthorInitial author={author} locale={locale} />

      <article className="min-w-0 flex-1 space-y-1">
        <ItemByline
          name={author}
          label={
            author
              ? tItem("addedBy", { name: author })
              : tItem("addedByUnknown")
          }
          dateTime={note.createdAt}
          locale={locale}
          size="compact"
        />

        <NoteContentDisclosure content={note.content} />

        {note.photos.length > 0 ? (
          <NotePhotoGallery authorName={note.author} photos={note.photos} />
        ) : null}
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
