import { describe, expect, it } from "vitest";
import type { Note, NotePhoto } from "@/features/notes/types/notes";
import { filterNotes } from "./note-filters";

const CURRENT_USER_ID = "alice-id";

const photo: NotePhoto = {
  id: 1,
  fileName: "cottage.jpg",
  fileSize: 1024,
  mimeType: "image/jpeg",
  storagePath: "notes/1/cottage.jpg",
  url: null,
  thumbnailUrl: null,
};

function note(id: number, overrides: Partial<Note> = {}): Note {
  return {
    id,
    content: `Note ${id}`,
    author: "Alice",
    authorId: CURRENT_USER_ID,
    createdAt: "2026-10-29T10:00:00.000Z",
    photos: [],
    ...overrides,
  };
}

function ids(notes: Note[]) {
  return notes.map((item) => item.id);
}

const mineWithPhoto = note(1, { photos: [photo] });
const mineWithoutPhoto = note(2);
const othersWithPhoto = note(3, {
  author: "Bob",
  authorId: "bob-id",
  photos: [photo],
});
const othersWithoutPhoto = note(4, { author: "Bob", authorId: "bob-id" });

const notes = [mineWithPhoto, mineWithoutPhoto, othersWithPhoto, othersWithoutPhoto];

describe("filterNotes", () => {
  it("returns every note for all", () => {
    expect(ids(filterNotes(notes, "all", CURRENT_USER_ID))).toEqual([1, 2, 3, 4]);
  });

  it("keeps only notes with at least one photo for photos", () => {
    expect(ids(filterNotes(notes, "photos", CURRENT_USER_ID))).toEqual([1, 3]);
  });

  it("keeps only the current user's notes for mine", () => {
    expect(ids(filterNotes(notes, "mine", CURRENT_USER_ID))).toEqual([1, 2]);
  });

  it("returns nothing for mine when the user has no notes", () => {
    expect(filterNotes(notes, "mine", "carol-id")).toEqual([]);
  });

  it("does not mutate the input", () => {
    const input = [...notes];

    filterNotes(input, "photos", CURRENT_USER_ID);

    expect(input).toEqual(notes);
  });
});
