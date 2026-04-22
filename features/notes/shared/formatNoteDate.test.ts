import { describe, expect, it } from "vitest";
import { formatNoteTimestamp } from "./formatNoteDate";

describe("features/notes/shared/formatNoteDate", () => {
  it("formats ISO timestamps with locale-aware date and time", () => {
    const isoDate = "2026-04-22T14:35:00.000Z";
    const utcDate = new Date(Date.UTC(2026, 3, 22, 14, 35, 0));

    expect(formatNoteTimestamp(isoDate, "en")).toBe(
      formatNoteTimestamp(utcDate, "en")
    );
  });

  it("falls back to the original string for invalid timestamps", () => {
    expect(formatNoteTimestamp("not-a-date", "en")).toBe("not-a-date");
  });
});
