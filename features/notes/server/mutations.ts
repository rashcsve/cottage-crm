import { SupabaseClient } from "@supabase/supabase-js";
import type { CreateNoteFormData } from "@/features/notes/schemas";
import type { MutationResult } from "@/lib/types/mutations.types";
import type { UploadedNotePhoto } from "@/features/notes/server/photo-storage";

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

export async function createNotePhotos(
  supabase: SupabaseClient,
  noteId: number,
  photos: UploadedNotePhoto[]
): Promise<MutationResult<void>> {
  if (photos.length === 0) {
    return { ok: true, data: undefined };
  }

  const { error } = await supabase.from("note_photos").insert(
    photos.map((photo) => ({
      note_id: noteId,
      file_name: photo.fileName,
      file_size: photo.fileSize,
      mime_type: photo.mimeType,
      sort_order: photo.sortOrder,
      storage_path: photo.storagePath,
    }))
  );

  if (error) {
    console.error("[createNotePhotos] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: undefined };
}

export async function getNotePhotoStoragePaths(
  supabase: SupabaseClient,
  noteId: number
): Promise<MutationResult<string[]>> {
  const { data, error } = await supabase
    .from("note_photos")
    .select("storage_path")
    .eq("note_id", noteId);

  if (error) {
    console.error("[getNotePhotoStoragePaths] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  return {
    ok: true,
    data: (data ?? []).map((photo) => photo.storage_path),
  };
}

export async function deleteNote(
  supabase: SupabaseClient,
  noteId: number
): Promise<MutationResult<void>> {
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[deleteNote] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  if (!data) {
    return { ok: false, error: "notFound" };
  }

  return { ok: true, data: undefined };
}
