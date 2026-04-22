import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapNoteRowToNote } from "@/features/notes/server/mappers";
import type { Note } from "@/features/notes/types/notes";

const NOTE_SELECT_COLUMNS = "id, content, author, author_id, created_at";

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

  return (data ?? []).map(mapNoteRowToNote);
}
