import { describe, expect, it } from "vitest";
import type { Note } from "@/features/notes/types/notes";
import { groupNotesByRecency } from "./note-groups";

const TODAY_ISO = "2026-10-29";

function note(id: number, createdAt: string): Note {
  return {
    id,
    content: `Note ${id}`,
    author: "Alice",
    authorId: "alice-id",
    createdAt,
    photos: [],
  };
}

function ids(notes: Note[]) {
  return notes.map((item) => item.id);
}

describe("groupNotesByRecency", () => {
  it("returns empty groups for no notes", () => {
    expect(groupNotesByRecency([], TODAY_ISO)).toEqual({
      thisWeek: [],
      earlier: [],
    });
  });

  it("puts today's notes in this week", () => {
    const groups = groupNotesByRecency(
      [note(1, "2026-10-29T08:00:00.000Z")],
      TODAY_ISO,
    );

    expect(ids(groups.thisWeek)).toEqual([1]);
    expect(groups.earlier).toEqual([]);
  });

  it("keeps notes from six days ago in this week and moves seven days ago to earlier", () => {
    const groups = groupNotesByRecency(
      [
        note(1, "2026-10-23T10:00:00.000Z"),
        note(2, "2026-10-22T10:00:00.000Z"),
      ],
      TODAY_ISO,
    );

    expect(ids(groups.thisWeek)).toEqual([1]);
    expect(ids(groups.earlier)).toEqual([2]);
  });

  it("uses the Prague calendar day, not the UTC day", () => {
    const groups = groupNotesByRecency(
      [
        note(1, "2026-10-22T23:30:00.000Z"),
        note(2, "2026-10-22T21:30:00.000Z"),
      ],
      TODAY_ISO,
    );

    expect(ids(groups.thisWeek)).toEqual([1]);
    expect(ids(groups.earlier)).toEqual([2]);
  });

  it("treats notes dated after today as this week", () => {
    const groups = groupNotesByRecency(
      [note(1, "2026-10-30T10:00:00.000Z")],
      TODAY_ISO,
    );

    expect(ids(groups.thisWeek)).toEqual([1]);
  });

  it("puts notes with an invalid timestamp in earlier", () => {
    const groups = groupNotesByRecency([note(1, "not-a-date")], TODAY_ISO);

    expect(groups.thisWeek).toEqual([]);
    expect(ids(groups.earlier)).toEqual([1]);
  });

  it("keeps the input order within each group", () => {
    const groups = groupNotesByRecency(
      [
        note(1, "2026-10-29T10:00:00.000Z"),
        note(2, "2026-10-01T10:00:00.000Z"),
        note(3, "2026-10-27T10:00:00.000Z"),
        note(4, "2026-09-15T10:00:00.000Z"),
      ],
      TODAY_ISO,
    );

    expect(ids(groups.thisWeek)).toEqual([1, 3]);
    expect(ids(groups.earlier)).toEqual([2, 4]);
  });
});
