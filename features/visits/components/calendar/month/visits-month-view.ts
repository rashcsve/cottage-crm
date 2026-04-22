import type { CalendarWeek } from "../../../domain/visits-calendar-types";
import {
  formatVisitWeekdayNarrow,
  formatVisitWeekdayShort,
} from "../../../shared/formatVisitDate";

type VisitsMonthWeekRow = CalendarWeek["rows"][number];
type VisitsMonthWeekSegment = VisitsMonthWeekRow[number];

export interface VisitsMonthTimelineFragment {
  segment: VisitsMonthWeekSegment;
  isStart: boolean;
  isEnd: boolean;
}

export interface VisitsMonthWeekdayHeaderItem {
  key: string;
  shortLabel: string;
  narrowLabel: string;
}

export type VisitsMonthTimelineDayRows =
  Array<VisitsMonthTimelineFragment | null>;
export type VisitsMonthTimelineWeekRows = VisitsMonthTimelineDayRows[];
export type VisitsMonthTimelineRowsByWeek = VisitsMonthTimelineWeekRows[];

function findTimelineSegmentForDay(params: {
  row: VisitsMonthWeekRow;
  dayIndex: number;
}): VisitsMonthWeekSegment | null {
  const { row, dayIndex } = params;

  return (
    row.find(
      (entry) =>
        dayIndex >= entry.startIndex && dayIndex < entry.startIndex + entry.span
    ) ?? null
  );
}

export function getTimelineFragmentForDay(params: {
  row: VisitsMonthWeekRow;
  dayIndex: number;
}): VisitsMonthTimelineFragment | null {
  const { row, dayIndex } = params;
  const segment = findTimelineSegmentForDay({ row, dayIndex });

  if (!segment) {
    return null;
  }

  return {
    segment,
    isStart: dayIndex === segment.startIndex,
    isEnd: dayIndex === segment.startIndex + segment.span - 1,
  };
}

export function buildWeekTimelineRows(
  week: CalendarWeek
): VisitsMonthTimelineWeekRows {
  return week.days.map((_, dayIndex) =>
    week.rows.map((row) =>
      getTimelineFragmentForDay({
        row,
        dayIndex,
      })
    )
  );
}

export function buildTimelineRowsByWeek(
  weeks: CalendarWeek[]
): VisitsMonthTimelineRowsByWeek {
  return weeks.map((week) => buildWeekTimelineRows(week));
}

export function getDayIsos(weeks: CalendarWeek[]): string[] {
  return weeks.flatMap((week) => week.days.map((day) => day.iso));
}

export function getActiveTabStopIso(
  weeks: CalendarWeek[],
  selectedDateIso: string | null
): string | null {
  if (selectedDateIso) {
    return selectedDateIso;
  }

  return weeks[0]?.days[0]?.iso ?? null;
}

export function buildWeekdayHeaderItems(
  weeks: CalendarWeek[],
  locale: string
): VisitsMonthWeekdayHeaderItem[] {
  const headerDays = weeks[0]?.days ?? [];

  return headerDays.map((day) => ({
    key: day.iso,
    shortLabel: formatVisitWeekdayShort(day.date, locale),
    narrowLabel: formatVisitWeekdayNarrow(day.date, locale),
  }));
}
