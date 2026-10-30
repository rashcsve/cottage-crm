export interface NotePhoto {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  url: string | null;
  thumbnailUrl: string | null;
}

export interface Note {
  id: number;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  photos: NotePhoto[];
}

export type NotesShowFilter = "all" | "photos" | "mine";

export interface NoteRecencyGroups {
  thisWeek: Note[];
  earlier: Note[];
}

export interface NotesPageData {
  notes: Note[];
  canManage: boolean;
  currentUserId: string;
  todayIso: string;
}
