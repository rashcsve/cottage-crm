import { NoteItem } from "./NoteItems";
import { Note } from "./types";

interface NoteListProps {
  notes: Note[];
  canManageNotes: boolean;
}

export function NotesList({ notes, canManageNotes }: NoteListProps) {
  if (notes.length === 0) {
    return <p className="text-stone-500">Zatím tu nejsou žádné poznámky.</p>;
  }

  return (
    <section className="space-y-3">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} canManageNotes={canManageNotes} />
      ))}
    </section>
  );
}
