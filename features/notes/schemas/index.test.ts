import { describe, expect, it } from "vitest";
import { NotesShowFilterSchema, parseNotesSearchParams } from "./index";

describe("NotesShowFilterSchema", () => {
  it.each(["all", "photos", "mine"] as const)("accepts %s", (value) => {
    expect(NotesShowFilterSchema.parse(value)).toBe(value);
  });
});

describe("parseNotesSearchParams", () => {
  it.each(["all", "photos", "mine"] as const)("keeps show=%s", (show) => {
    expect(parseNotesSearchParams({ show })).toEqual({ activeShow: show });
  });

  it.each([
    { label: "an unknown value", show: "bogus" },
    { label: "a missing value", show: undefined },
    { label: "a repeated param", show: ["photos", "mine"] },
  ])("falls back to all for $label", ({ show }) => {
    expect(parseNotesSearchParams({ show })).toEqual({ activeShow: "all" });
  });
});
