import { describe, expect, it } from "vitest";
import {
  getWeekColumnSpanClass,
  getWeekColumnStartClass,
  getWeekHighlightSpan,
} from "./visits-week-view";

describe("getWeekColumnStartClass", () => {
  it.each([
    { columnIndex: 0, className: "col-start-1" },
    { columnIndex: 6, className: "col-start-7" },
  ])("maps column $columnIndex to $className", ({ columnIndex, className }) => {
    expect(getWeekColumnStartClass(columnIndex)).toBe(className);
  });

  it.each([-1, 7])("throws for column %i outside the week", (columnIndex) => {
    expect(() => getWeekColumnStartClass(columnIndex)).toThrow(/out of range/);
  });
});

describe("getWeekColumnSpanClass", () => {
  it.each([
    { span: 1, className: "col-span-1" },
    { span: 7, className: "col-span-7" },
  ])("maps span $span to $className", ({ span, className }) => {
    expect(getWeekColumnSpanClass(span)).toBe(className);
  });

  it.each([0, 8])("throws for span %i outside the week", (span) => {
    expect(() => getWeekColumnSpanClass(span)).toThrow(/out of range/);
  });
});

describe("getWeekHighlightSpan", () => {
  const dayIsos = [
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
  ];

  it("spans the draft range from its first to its last day", () => {
    expect(
      getWeekHighlightSpan(dayIsos, "2026-10-30", {
        dateFrom: "2026-10-30",
        dateTo: "2026-11-01",
      }),
    ).toEqual({ startIndex: 4, span: 3 });
  });

  it("clips a draft range that runs past the visible week", () => {
    expect(
      getWeekHighlightSpan(dayIsos, "2026-10-31", {
        dateFrom: "2026-10-31",
        dateTo: "2026-11-03",
      }),
    ).toEqual({ startIndex: 5, span: 2 });
  });

  it("highlights only the selected day without a draft range", () => {
    expect(getWeekHighlightSpan(dayIsos, "2026-10-28", null)).toEqual({
      startIndex: 2,
      span: 1,
    });
  });

  it("returns null when nothing in the week is selected", () => {
    expect(getWeekHighlightSpan(dayIsos, "2026-11-05", null)).toBeNull();
    expect(getWeekHighlightSpan(dayIsos, null, null)).toBeNull();
  });
});
