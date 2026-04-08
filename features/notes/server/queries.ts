"use server";

import { createClient } from "@/lib/supabase/server";
import { Note, NoteListResponse } from "../types/notes";

export async function getNotesList(): Promise<NoteListResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("id, content, author, author_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Nepodařilo se načíst poznámky: ${error.message}`);
  }

  return (data as Note[]) || [];
}
