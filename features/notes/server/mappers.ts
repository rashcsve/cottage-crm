import type { Note } from "@/features/notes/types/notes";

export interface NoteRow {
  id: number;
  content: string;
  author: string;
  author_id: string;
  created_at: string;
}

/**
 * Map database row to Note domain type.
 * Ensures type safety at the data boundary.
 *
 * @param row Raw database row
 * @returns Typed Note object
 */
export function mapNoteRowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    content: row.content,
    author: row.author,
    authorId: row.author_id,
    createdAt: row.created_at,
  };
}
