import { describe, expect, it } from "vitest";
import {
  buildMonthWeeks,
  buildWeek,
  getAnchorLabel,
  getAgendaSections,
  normalizeCalendarRange,
  shiftAnchor,
} from "./visits-calendar";
import type { Visit } from "../types/visits";

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Svetlana and Filip",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming",
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("features/visits/domain/visits-calendar", () => {
  it("normalizes date ranges regardless of selection order", () => {
    expect(normalizeCalendarRange("2026-04-14", "2026-04-12")).toEqual({
      dateFrom: "2026-04-12",
      dateTo: "2026-04-14",
    });
  });

  it("builds month weeks with multi-day segments that span the correct columns", () => {
    const weeks = buildMonthWeeks({
      anchorIso: "2026-04-15",
      locale: "en",
      todayIso: "2026-04-10",
      visits: [createVisit()],
    });
    const targetWeek = weeks.find((week) => week.key === "2026-04-05");

    expect(targetWeek?.rows[0]?.[0]).toMatchObject({
      startIndex: 5,
      span: 2,
      continuesBefore: false,
      continuesAfter: true,
    });
  });

  it("builds week rows with carry-over segments for visits that start before the week", () => {
    const week = buildWeek({
      anchorIso: "2026-04-02",
      locale: "en",
      todayIso: "2026-04-02",
      visits: [
        createVisit({
          id: 2,
          dateFrom: "2026-03-30",
          dateTo: "2026-04-02",
        }),
      ],
    });

    expect(week.rows[0]?.[0]).toMatchObject({
      startIndex: 1,
      span: 4,
      continuesBefore: false,
      continuesAfter: false,
    });
  });

  it("filters agenda sections to the visible month and groups overlapping stays on the first visible day", () => {
    const sections = getAgendaSections(
      [
        createVisit({
          id: 3,
          dateFrom: "2026-03-30",
          dateTo: "2026-04-02",
        }),
        createVisit({
          id: 4,
          dateFrom: "2026-05-10",
          dateTo: "2026-05-11",
        }),
      ],
      "2026-04-15",
      "en",
    );

    expect(sections).toHaveLength(1);
    expect(sections[0]?.key).toBe("2026-04-01");
    expect(sections[0]?.visits).toHaveLength(1);
  });

  it("keeps agenda visit order when the caller already provides sorted visits", () => {
    const sections = getAgendaSections(
      [
        createVisit({
          id: 5,
          visitorName: "Anna",
          dateFrom: "2026-04-02",
          dateTo: "2026-04-04",
        }),
        createVisit({
          id: 6,
          visitorName: "Boris",
          dateFrom: "2026-04-02",
          dateTo: "2026-04-03",
        }),
      ],
      "2026-04-15",
      "en",
    );

    expect(sections[0]?.visits.map((visit) => visit.id)).toEqual([5, 6]);
  });

  it("formats toolbar anchor labels with the shared visits date formatting", () => {
    expect(getAnchorLabel("month", "2026-04-15", "en")).toBe("April 2026");
    expect(getAnchorLabel("agenda", "2026-04-15", "en")).toBe("April 2026");
    expect(getAnchorLabel("week", "2026-04-10", "en")).toBe(
      "Apr 5 – 11, 2026",
    );
  });

  it("shifts month anchors to the start of the next visible month", () => {
    expect(shiftAnchor("month", "2026-01-31", 1)).toBe("2026-02-01");
    expect(shiftAnchor("agenda", "2026-04-19", 1)).toBe("2026-05-01");
    expect(shiftAnchor("week", "2026-04-10", 1)).toBe("2026-04-17");
  });
});
