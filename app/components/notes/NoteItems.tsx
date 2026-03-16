import { NoteActions } from "./NoteActions";
import { Note } from "./types";

interface NoteItemProps {
  note: Note;
  canManageNotes: boolean;
}

export function NoteItem({ note, canManageNotes }: NoteItemProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="whitespace-pre-wrap text-stone-800">{note.content}</p>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-stone-500">
        <span>
          {note.author} •{" "}
          {new Date(note.created_at).toLocaleDateString("cs-CZ")}
        </span>

        {canManageNotes && <NoteActions noteId={note.id} />}
      </div>
    </article>
  );
}
