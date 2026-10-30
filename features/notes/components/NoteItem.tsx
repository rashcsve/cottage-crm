"use client";

import { useLocale, useTranslations } from "next-intl";
import { NoteActions } from "@/features/notes/components/NoteActions";
import { NoteContentDisclosure } from "@/features/notes/components/NoteContentDisclosure";
import { NotePhotoGallery } from "@/features/notes/components/NotePhotoGallery";
import type { Note } from "@/features/notes/types/notes";
import { ItemByline } from "@/shared/ui/ItemByline";
import { RowListItem } from "@/shared/ui/RowList";

const AVATAR_FALLBACK = "?";
const AVATAR_CLASS =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-ink-secondary";

function getAuthorInitial(author: string, locale: string): string {
  return (
    Array.from(author.trim())[0]?.toLocaleUpperCase(locale) ?? AVATAR_FALLBACK
  );
}

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
      <span aria-hidden="true" className={AVATAR_CLASS}>
        {getAuthorInitial(note.author, locale)}
      </span>

      <article className="min-w-0 flex-1 space-y-1">
        <ItemByline
          name={note.author}
          label={tItem("addedBy", { name: note.author })}
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
