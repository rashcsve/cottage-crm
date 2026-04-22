import type { Note, NotePhoto } from "@/features/notes/types/notes";

export interface NotePhotoRow {
  id: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  storage_path: string;
}

export interface NoteRow {
  id: number;
  content: string;
  author: string;
  author_id: string;
  created_at: string;
  note_photos: NotePhotoRow[] | null;
}

export function mapNoteRowToNote(
  row: NoteRow,
  signedPhotoUrlMap: Map<string, string | null>
): Note {
  const photos = (row.note_photos ?? [])
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((photo): NotePhoto => ({
      id: photo.id,
      fileName: photo.file_name,
      fileSize: photo.file_size,
      mimeType: photo.mime_type,
      storagePath: photo.storage_path,
      url: signedPhotoUrlMap.get(photo.storage_path) ?? null,
    }));

  return {
    id: row.id,
    content: row.content,
    author: row.author,
    authorId: row.author_id,
    createdAt: row.created_at,
    photos,
  };
}
