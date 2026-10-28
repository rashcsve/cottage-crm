import { describe, expect, it } from "vitest";
import { mapNoteRowToNote, type NoteRow } from "@/features/notes/server/mappers";

const STORAGE_PATH = "user/7/00-porch.webp";
const THUMBNAIL_PATH = "user/7/thumbnails/00-porch.jpg";

function createRow(): NoteRow {
  return {
    id: 7,
    content: "Porch",
    author_id: "user",
    created_at: "2026-10-28T10:00:00Z",
    author: { display_name: "Alice Johnson" },
    note_photos: [
      {
        id: 1,
        file_name: "porch.webp",
        file_size: 1234,
        mime_type: "image/webp",
        sort_order: 0,
        storage_path: STORAGE_PATH,
        thumbnail_path: THUMBNAIL_PATH,
      },
    ],
  };
}

describe("features/notes/server/mappers", () => {
  it("maps the signed photo and thumbnail urls", () => {
    const note = mapNoteRowToNote(
      createRow(),
      new Map([
        [STORAGE_PATH, "https://signed/photo"],
        [THUMBNAIL_PATH, "https://signed/thumb"],
      ])
    );

    expect(note.photos[0]).toMatchObject({
      storagePath: STORAGE_PATH,
      url: "https://signed/photo",
      thumbnailUrl: "https://signed/thumb",
    });
  });

  it("has no urls when signing failed", () => {
    const note = mapNoteRowToNote(
      createRow(),
      new Map([
        [STORAGE_PATH, null],
        [THUMBNAIL_PATH, null],
      ])
    );

    expect(note.photos[0]).toMatchObject({ url: null, thumbnailUrl: null });
  });
});
