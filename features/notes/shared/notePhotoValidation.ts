const MEGABYTE_IN_BYTES = 1024 * 1024;

export const NOTE_PHOTO_MAX_COUNT = 4;
export const NOTE_PHOTO_MAX_SIZE_BYTES = MEGABYTE_IN_BYTES;
export const NOTE_FORM_OVERHEAD_BYTES = 256 * 1024;
export const SERVER_ACTION_BODY_SIZE_LIMIT_BYTES =
  NOTE_PHOTO_MAX_COUNT * NOTE_PHOTO_MAX_SIZE_BYTES + NOTE_FORM_OVERHEAD_BYTES;
export const HOSTING_REQUEST_BODY_LIMIT_BYTES = 4_500_000;
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

export function isAcceptedNotePhotoType(type: string): boolean {
  return NOTE_PHOTO_ACCEPTED_TYPES.includes(
    type as (typeof NOTE_PHOTO_ACCEPTED_TYPES)[number]
  );
}

export function validateNotePhotoFiles(
  files: File[],
  messages: NotePhotoValidationMessages
): string | null {
  if (files.length > NOTE_PHOTO_MAX_COUNT) {
    return messages.tooMany;
  }

  for (const file of files) {
    if (!isAcceptedNotePhotoType(file.type)) {
      return messages.invalidType;
    }

    if (file.size > NOTE_PHOTO_MAX_SIZE_BYTES) {
      return messages.tooLarge;
    }
  }

  return null;
}
