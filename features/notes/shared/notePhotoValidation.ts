const MEGABYTE_IN_BYTES = 1024 * 1024;

export const NOTE_PHOTO_MAX_COUNT = 4;
export const NOTE_PHOTO_MAX_SIZE_BYTES = MEGABYTE_IN_BYTES;
export const NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES = 48 * 1024;
export const NOTE_FORM_OVERHEAD_BYTES = 256 * 1024;
export const SERVER_ACTION_BODY_SIZE_LIMIT_BYTES =
  NOTE_PHOTO_MAX_COUNT * NOTE_PHOTO_MAX_SIZE_BYTES + NOTE_FORM_OVERHEAD_BYTES;
export const HOSTING_REQUEST_BODY_LIMIT_BYTES = 4_500_000;
export const NOTE_PHOTO_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
const NOTE_PHOTO_THUMBNAIL_TYPES = ["image/webp", "image/jpeg"] as const;
const NOTE_PHOTO_HEIC_TYPES = ["image/heic", "image/heif"] as const;
const NOTE_PHOTO_HEIC_EXTENSIONS = [".heic", ".heif"] as const;
export const NOTE_PHOTO_INPUT_ACCEPT = [
  ...NOTE_PHOTO_ACCEPTED_TYPES,
  ...NOTE_PHOTO_HEIC_TYPES,
  ...NOTE_PHOTO_HEIC_EXTENSIONS,
].join(",");

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

export function isValidNotePhotoThumbnailFile(file: File): boolean {
  return (
    NOTE_PHOTO_THUMBNAIL_TYPES.includes(
      file.type as (typeof NOTE_PHOTO_THUMBNAIL_TYPES)[number]
    ) &&
    file.size > 0 &&
    file.size <= NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES
  );
}

export function isHeicNotePhotoFile(file: File): boolean {
  if (NOTE_PHOTO_HEIC_TYPES.includes(file.type as (typeof NOTE_PHOTO_HEIC_TYPES)[number])) {
    return true;
  }

  if (isAcceptedNotePhotoType(file.type)) {
    return false;
  }

  const fileName = file.name.toLowerCase();
  return NOTE_PHOTO_HEIC_EXTENSIONS.some((extension) => fileName.endsWith(extension));
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
