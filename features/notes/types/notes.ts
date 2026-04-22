export interface NotePhoto {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  url: string | null;
}

export interface Note {
  id: number;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  photos: NotePhoto[];
}

export interface NotesPageData {
  notes: Note[];
  canManage: boolean;
}
