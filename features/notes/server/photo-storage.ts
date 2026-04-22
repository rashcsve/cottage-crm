import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const NOTE_PHOTOS_BUCKET = "note-photos";
const NOTE_PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60;

export interface UploadedNotePhoto {
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  storagePath: string;
}

function getNotePhotoFileExtension(file: File): string {
  const fileNameExtension = file.name.split(".").pop()?.trim().toLowerCase();

  if (fileNameExtension) {
    return fileNameExtension;
  }

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function createNotePhotoStoragePath(
  userId: string,
  noteId: number,
  file: File,
  sortOrder: number
) {
  const fileExtension = getNotePhotoFileExtension(file);

  return `${userId}/${noteId}/${String(sortOrder).padStart(2, "0")}-${crypto.randomUUID()}.${fileExtension}`;
}

export async function uploadNotePhotos(
  supabase: SupabaseClient,
  userId: string,
  noteId: number,
  files: File[]
): Promise<{ ok: true; data: UploadedNotePhoto[] } | { ok: false }> {
  const uploadedPaths: string[] = [];
  const uploadedPhotos: UploadedNotePhoto[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const storagePath = createNotePhotoStoragePath(
        userId,
        noteId,
        file,
        index
      );
      const { error } = await supabase.storage
        .from(NOTE_PHOTOS_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("[uploadNotePhotos] Storage upload failed:", error);
        await removeNotePhotoObjects(supabase, uploadedPaths);
        return { ok: false };
      }

      uploadedPaths.push(storagePath);
      uploadedPhotos.push({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        sortOrder: index,
        storagePath,
      });
    }

    return {
      ok: true,
      data: uploadedPhotos,
    };
  } catch (error) {
    console.error("[uploadNotePhotos] Unexpected error:", error);
    await removeNotePhotoObjects(supabase, uploadedPaths);
    return { ok: false };
  }
}

export async function removeNotePhotoObjects(
  supabase: SupabaseClient,
  storagePaths: string[]
) {
  if (storagePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from(NOTE_PHOTOS_BUCKET)
    .remove(storagePaths);

  if (error) {
    console.error("[removeNotePhotoObjects] Storage remove failed:", error);
  }
}

export async function createSignedNotePhotoUrlMap(
  supabase: SupabaseClient,
  storagePaths: string[]
) {
  const uniqueStoragePaths = Array.from(new Set(storagePaths));

  if (uniqueStoragePaths.length === 0) {
    return new Map<string, string | null>();
  }

  const { data, error } = await supabase.storage
    .from(NOTE_PHOTOS_BUCKET)
    .createSignedUrls(uniqueStoragePaths, NOTE_PHOTO_SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("[createSignedNotePhotoUrlMap] Storage signing failed:", error);
    return new Map(
      uniqueStoragePaths.map((storagePath) => [storagePath, null] as const)
    );
  }

  const map = new Map<string, string | null>();
  for (const item of data) {
    if (item.path !== null) {
      map.set(item.path, item.signedUrl ?? null);
    }
  }
  return map;
}
