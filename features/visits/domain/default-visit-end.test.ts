import { describe, expect, it } from "vitest";
import { getDefaultVisitEnd } from "./default-visit-end";

describe("getDefaultVisitEnd", () => {
  it.each([
    ["Thursday", "2026-10-29", "2026-10-29"],
    ["Friday", "2026-10-30", "2026-11-01"],
    ["Saturday", "2026-10-31", "2026-11-01"],
    ["Sunday", "2026-11-01", "2026-11-01"],
    ["Friday at a month boundary", "2026-07-31", "2026-08-02"],
  ])("%s %s ends on %s", (_label, dateFrom, expected) => {
    expect(getDefaultVisitEnd(dateFrom)).toBe(expected);
  });
});
