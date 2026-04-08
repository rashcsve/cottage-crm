"use server";

import { createClient } from "@/lib/supabase/server";
import { mapNoteRowToNote } from "@/features/notes/server/mappers";
import type { NoteListResponse } from "@/features/notes/types/notes";

/**
 * Fetch all notes ordered by creation date (newest first).
 * Handles Supabase errors and returns empty array on failure.
 *
 * @returns Array of notes, or empty array on error
 * @throws Error with context if query fails
 */
export async function getNotesList(): Promise<NoteListResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notes")
      .select("id, content, author, author_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getNotesList] Supabase error:", error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(mapNoteRowToNote);
  } catch (error) {
    console.error("[getNotesList] Exception:", error);
    throw error;
  }
}
