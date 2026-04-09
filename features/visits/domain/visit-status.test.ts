import { describe, expect, it } from "vitest";
import { calculateVisitStats, getVisitStatus } from "./visit-status";

describe("features/visits/domain/visit-status", () => {
  const TODAY = "2026-04-09";

  it("returns past when the visit ends before today", () => {
    expect(getVisitStatus("2026-04-01", "2026-04-08", TODAY)).toBe("past");
  });

  it("returns upcoming when the visit starts after today", () => {
    expect(getVisitStatus("2026-04-10", "2026-04-12", TODAY)).toBe("upcoming");
  });

  it("returns current when today is inside the visit range", () => {
    expect(getVisitStatus("2026-04-08", "2026-04-10", TODAY)).toBe("current");
  });

  it("calculates stats using the provided today value", () => {
    expect(
      calculateVisitStats(
        [
          { dateFrom: "2026-04-01", dateTo: "2026-04-08" },
          { dateFrom: "2026-04-09", dateTo: "2026-04-09" },
          { dateFrom: "2026-04-10", dateTo: "2026-04-12" },
        ],
        TODAY
      )
    ).toEqual({
      past: 1,
      current: 1,
      upcoming: 1,
    });
  });
});
