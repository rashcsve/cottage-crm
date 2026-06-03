import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const NOTE_PHOTOS_BUCKET = "note-photos";

// Verify file bytes match the declared MIME type.
// file.type is browser-controlled and can be spoofed; reading the actual bytes
// catches content that is not a real image even when the MIME type looks valid.
const IMAGE_BYTE_CHECKS: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  // WebP: "RIFF" at 0–3, "WEBP" at 8–11
  "image/webp": (b) =>
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
};

export async function hasValidImageSignature(file: File): Promise<boolean> {
  const check = IMAGE_BYTE_CHECKS[file.type];
  if (!check) return false;
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    return check(new Uint8Array(buffer));
  } catch {
    return false;
  }
}
const NOTE_PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

export interface UploadedNotePhoto {
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  storagePath: string;
}

function getNotePhotoFileExtension(mimeType: string): string {
  switch (mimeType) {
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
  mimeType: string,
  sortOrder: number
) {
  const fileExtension = getNotePhotoFileExtension(mimeType);

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
        file.type,
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
