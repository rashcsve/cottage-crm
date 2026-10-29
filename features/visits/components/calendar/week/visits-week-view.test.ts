import { describe, expect, it } from "vitest";
import {
  getWeekColumnSpanClass,
  getWeekColumnStartClass,
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
