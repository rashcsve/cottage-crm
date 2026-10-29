import { isDateWithinRange } from "../../../domain/visits-calendar";
import type {
  CalendarDateRange,
  CalendarWeek,
} from "../../../domain/visits-calendar-types";

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

export function getWeekHighlightSpan(
  dayIsos: string[],
  selectedDateIso: string | null,
  draftRange: CalendarDateRange | null
): { startIndex: number; span: number } | null {
  const highlightedIndexes = dayIsos.flatMap((iso, index) =>
    isDateWithinRange(iso, draftRange) ? [index] : []
  );

  if (highlightedIndexes.length === 0 && selectedDateIso) {
    const selectedIndex = dayIsos.indexOf(selectedDateIso);

    if (selectedIndex !== -1) {
      highlightedIndexes.push(selectedIndex);
    }
  }

  const startIndex = highlightedIndexes[0];
  const endIndex = highlightedIndexes.at(-1);

  if (startIndex === undefined || endIndex === undefined) {
    return null;
  }

  return { startIndex, span: endIndex - startIndex + 1 };
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
