import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapNoteRowToNote } from "@/features/notes/server/mappers";
import type { Note } from "@/features/notes/types/notes";
import { createSignedNotePhotoUrlMap } from "@/features/notes/server/photo-storage";

const NOTE_SELECT_COLUMNS =
  "id, content, author, author_id, created_at, note_photos(id, file_name, file_size, mime_type, sort_order, storage_path)";
const NOTE_SUMMARY_SELECT_COLUMNS =
  "id, content, author, author_id, created_at";

export async function getAllNotes(): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllNotes] Query failed:", error);
    throw new Error("Failed to fetch notes");
  }

  const signedPhotoUrlMap = await createSignedNotePhotoUrlMap(
    supabase,
    (data ?? []).flatMap((note) =>
      (note.note_photos ?? []).map((photo) => photo.storage_path)
    )
  );

  return (data ?? []).map((note) => mapNoteRowToNote(note, signedPhotoUrlMap));
}

export async function getRecentNotes(limit: number): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SUMMARY_SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentNotes] Query failed:", error);
    throw new Error("Failed to fetch recent notes");
  }

  return (data ?? []).map((note) => ({
    id: note.id,
    content: note.content,
    author: note.author,
    authorId: note.author_id,
    createdAt: note.created_at,
    photos: [],
  }));
}
