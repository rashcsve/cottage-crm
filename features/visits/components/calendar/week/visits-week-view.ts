import type { CalendarWeek } from "../../../domain/visits-calendar-types";

type VisitsWeekRow = CalendarWeek["rows"][number];
type VisitsWeekSegment = VisitsWeekRow[number];
type VisitsWeekDay = CalendarWeek["days"][number];

export interface VisitsWeekTimelineFragment {
  segment: VisitsWeekSegment;
  isStart: boolean;
  isEnd: boolean;
}

export type VisitsWeekTimelineRowsByDay = Array<
  Array<VisitsWeekTimelineFragment | null>
>;

export function getTimelineFragmentForDay(params: {
  row: VisitsWeekRow;
  dayIndex: number;
}): VisitsWeekTimelineFragment | null {
  const { row, dayIndex } = params;

  const segment =
    row.find(
      (entry) =>
        dayIndex >= entry.startIndex && dayIndex < entry.startIndex + entry.span
    ) ?? null;

  if (!segment) {
    return null;
  }

  return {
    segment,
    isStart: dayIndex === segment.startIndex,
    isEnd: dayIndex === segment.startIndex + segment.span - 1,
  };
}

export function buildTimelineRowsByDay(
  week: CalendarWeek
): VisitsWeekTimelineRowsByDay {
  return week.days.map((_, dayIndex) =>
    week.rows.map((row) =>
      getTimelineFragmentForDay({
        row,
        dayIndex,
      })
    )
  );
}

export function getDayIsos(week: CalendarWeek): string[] {
  return week.days.map((day) => day.iso);
}

export function getDayIndexByIso(dayIsos: string[]): Map<string, number> {
  const indexByIso = new Map<string, number>();

  dayIsos.forEach((iso, index) => {
    indexByIso.set(iso, index);
  });

  return indexByIso;
}

export function getSelectedDay(
  week: CalendarWeek,
  selectedDateIso: string | null
): VisitsWeekDay | null {
  if (!selectedDateIso) {
    return null;
  }

  return week.days.find((day) => day.iso === selectedDateIso) ?? null;
}

export function getActiveTabStopIso(
  week: CalendarWeek,
  selectedDateIso: string | null
): string | null {
  if (selectedDateIso && week.days.some((day) => day.iso === selectedDateIso)) {
    return selectedDateIso;
  }

  return week.days[0]?.iso ?? null;
}
