import { SupabaseClient } from "@supabase/supabase-js";
import type { CreateNoteFormData } from "@/features/notes/schemas";
import type { MutationResult } from "@/lib/types/mutations.types";

/**
 * Insert a new note row.
 * Authorization is handled by the calling server action.
 *
 * @param supabase Supabase client instance
 * @param userId ID of the user creating the note
 * @param displayName Display name of the user creating the note
 * @param input Form data with note content
 * @returns MutationResult with note ID or error
 */
export async function createNote(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
  input: CreateNoteFormData
): Promise<MutationResult<{ id: number }>> {
  const { content } = input;

  const { data, error } = await supabase
    .from("notes")
    .insert({
      content,
      author: displayName,
      author_id: userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createNote] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  if (!data) {
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: { id: data.id } };
}

/**
 * Delete a note row by ID.
 * Authorization is handled by the calling server action.
 *
 * @param supabase Supabase client instance
 * @param noteId ID of the note to delete
 * @returns MutationResult with void or error
 */
export async function deleteNote(
  supabase: SupabaseClient,
  noteId: number
): Promise<MutationResult<void>> {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    console.error("[deleteNote] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: undefined };
}
