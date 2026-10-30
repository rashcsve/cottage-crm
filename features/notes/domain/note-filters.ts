import type { Note, NotesShowFilter } from "@/features/notes/types/notes";

export function filterNotes(
  notes: Note[],
  show: NotesShowFilter,
  currentUserId: string,
): Note[] {
  switch (show) {
    case "all":
      return [...notes];
    case "photos":
      return notes.filter((note) => note.photos.length > 0);
    case "mine":
      return notes.filter((note) => note.authorId === currentUserId);
    default: {
      const exhaustive: never = show;
      return exhaustive;
    }
  }
}
