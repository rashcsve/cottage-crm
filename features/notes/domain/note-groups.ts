import type { Note, NoteRecencyGroups } from "@/features/notes/types/notes";
import { diffDateOnlyInDays, toPragueDateOnly } from "@/lib/utils/date";

const THIS_WEEK_DAYS = 7;

function isFromThisWeek(note: Note, todayIso: string): boolean {
  const noteIso = toPragueDateOnly(new Date(note.createdAt));

  if (noteIso === null) {
    return false;
  }

  return diffDateOnlyInDays(noteIso, todayIso) < THIS_WEEK_DAYS;
}

export function groupNotesByRecency(
  notes: Note[],
  todayIso: string,
): NoteRecencyGroups {
  const groups: NoteRecencyGroups = { thisWeek: [], earlier: [] };

  for (const note of notes) {
    if (isFromThisWeek(note, todayIso)) {
      groups.thisWeek.push(note);
    } else {
      groups.earlier.push(note);
    }
  }

  return groups;
}
