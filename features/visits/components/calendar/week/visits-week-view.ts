import type { CalendarWeek } from "../../../domain/visits-calendar-types";

type VisitsWeekDay = CalendarWeek["days"][number];

export const WEEK_COLUMN_START_CLASSES = [
  "col-start-1",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
] as const;

export const WEEK_COLUMN_SPAN_CLASSES = [
  "col-span-1",
  "col-span-2",
  "col-span-3",
  "col-span-4",
  "col-span-5",
  "col-span-6",
  "col-span-7",
] as const;

export function getWeekColumnStartClass(columnIndex: number): string {
  const className = WEEK_COLUMN_START_CLASSES[columnIndex];

  if (!className) {
    throw new Error(`Week column index out of range: ${columnIndex}`);
  }

  return className;
}

export function getWeekColumnSpanClass(span: number): string {
  const className = WEEK_COLUMN_SPAN_CLASSES[span - 1];

  if (!className) {
    throw new Error(`Week column span out of range: ${span}`);
  }

  return className;
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
