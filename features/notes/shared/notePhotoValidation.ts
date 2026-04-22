const MEGABYTE_IN_BYTES = 1024 * 1024;

export const NOTE_PHOTO_MAX_COUNT = 4;
export const NOTE_PHOTO_MAX_SIZE_BYTES = 6 * MEGABYTE_IN_BYTES;
export const NOTE_PHOTO_MAX_SIZE_MB = NOTE_PHOTO_MAX_SIZE_BYTES / MEGABYTE_IN_BYTES;
export const NOTE_PHOTO_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const NOTE_PHOTO_INPUT_ACCEPT = NOTE_PHOTO_ACCEPTED_TYPES.join(",");

export interface NotePhotoValidationMessages {
  tooMany: string;
  invalidType: string;
  tooLarge: string;
}

export function validateNotePhotoFiles(
  files: File[],
  messages: NotePhotoValidationMessages
): string | null {
  if (files.length > NOTE_PHOTO_MAX_COUNT) {
    return messages.tooMany;
  }

  for (const file of files) {
    if (!NOTE_PHOTO_ACCEPTED_TYPES.includes(file.type as (typeof NOTE_PHOTO_ACCEPTED_TYPES)[number])) {
      return messages.invalidType;
    }

    if (file.size > NOTE_PHOTO_MAX_SIZE_BYTES) {
      return messages.tooLarge;
    }
  }

  return null;
}
