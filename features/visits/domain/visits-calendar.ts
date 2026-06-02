import {
  addDaysUtc,
  compareDateOnly,
  diffDateOnlyInDays,
  formatDateOnlyUtc,
  parseDateOnlyUtc,
} from "@/lib/utils/date";
import {
  formatVisitCompactDate,
  formatVisitMonthLabel,
  formatVisitWeekRangeLabel,
} from "../shared/formatVisitDate";
import type {
  CalendarDay,
  CalendarDateRange,
  CalendarSegment,
  CalendarWeek,
  VisitsCalendarView,
} from "./visits-calendar-types";
import type { Visit } from "../types/visits";

interface AgendaSection {
  key: string;
  label: string;
  visits: Visit[];
}

function startOfWeekUtc(date: Date, weekStartsOn: 0 | 1): Date {
  const day = date.getUTCDay();
  const distance = (day - weekStartsOn + 7) % 7;

  return addDaysUtc(date, -distance);
}

function startOfMonthUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonthUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

export function isDayVisibleInMonthGrid(
  anchorIso: string,
  locale: string,
  dayIso: string,
): boolean {
  const anchorDate = parseDateOnlyUtc(anchorIso);
  const weekStartsOn = getLocaleWeekStartsOn(locale);
  const monthStart = startOfMonthUtc(anchorDate);
  const monthEnd = endOfMonthUtc(anchorDate);
  const gridStart = startOfWeekUtc(monthStart, weekStartsOn);
  const gridEnd = addDaysUtc(
    startOfWeekUtc(addDaysUtc(monthEnd, 6), weekStartsOn),
    6,
  );

  return (
    compareDateOnly(formatDateOnlyUtc(gridStart), dayIso) <= 0 &&
    compareDateOnly(dayIso, formatDateOnlyUtc(gridEnd)) <= 0
  );
}

// Fallback needed for browsers/locales that do not expose `Intl.Locale.weekInfo`.
export function getLocaleWeekStartsOn(locale: string): 0 | 1 {
  try {
    const localeInfo = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: {
        firstDay?: number;
      };
    };
    const firstDay = localeInfo.weekInfo?.firstDay;

    if (firstDay === 1) {
      return 1;
    }

    if (firstDay === 7) {
      return 0;
    }
  } catch {}

  return locale.startsWith("cs") ? 1 : 0;
}

export function normalizeCalendarRange(
  dateFrom: string,
  dateTo: string,
): CalendarDateRange {
  if (compareDateOnly(dateFrom, dateTo) <= 0) {
    return { dateFrom, dateTo };
  }

  return {
    dateFrom: dateTo,
    dateTo: dateFrom,
  };
}

export function isDateWithinRange(
  iso: string,
  range: CalendarDateRange | null,
): boolean {
  if (!range) {
    return false;
  }

  return (
    compareDateOnly(range.dateFrom, iso) <= 0 &&
    compareDateOnly(iso, range.dateTo) <= 0
  );
}

export function sortVisitsByRange(left: Visit, right: Visit): number {
  return (
    compareDateOnly(left.dateFrom, right.dateFrom) ||
    compareDateOnly(left.dateTo, right.dateTo) ||
    left.visitorName.localeCompare(right.visitorName)
  );
}

export function visitIncludesDay(visit: Visit, dayIso: string): boolean {
  return (
    compareDateOnly(visit.dateFrom, dayIso) <= 0 &&
    compareDateOnly(dayIso, visit.dateTo) <= 0
  );
}

export function visitOverlapsRange(
  visit: Visit,
  rangeStartIso: string,
  rangeEndIso: string,
): boolean {
  return (
    compareDateOnly(visit.dateFrom, rangeEndIso) <= 0 &&
    compareDateOnly(visit.dateTo, rangeStartIso) >= 0
  );
}

export function getVisitsForDay(visits: Visit[], dayIso: string): Visit[] {
  return [...visits]
    .filter((visit) => visitIncludesDay(visit, dayIso))
    .sort(sortVisitsByRange);
}

function buildDayVisitsMap(
  visits: Visit[],
  rangeStartIso: string,
  rangeEndIso: string,
) {
  const visitsByDay = new Map<string, Visit[]>();

  for (const visit of visits) {
    if (!visitOverlapsRange(visit, rangeStartIso, rangeEndIso)) {
      continue;
    }

    const visibleStartIso =
      compareDateOnly(visit.dateFrom, rangeStartIso) < 0
        ? rangeStartIso
        : visit.dateFrom;
    const visibleEndIso =
      compareDateOnly(visit.dateTo, rangeEndIso) > 0
        ? rangeEndIso
        : visit.dateTo;
    const visibleEndDate = parseDateOnlyUtc(visibleEndIso);

    for (
      let cursor = parseDateOnlyUtc(visibleStartIso);
      cursor.getTime() <= visibleEndDate.getTime();
      cursor = addDaysUtc(cursor, 1)
    ) {
      const dayIso = formatDateOnlyUtc(cursor);
      const bucket = visitsByDay.get(dayIso);

      if (bucket) {
        bucket.push(visit);
        continue;
      }

      visitsByDay.set(dayIso, [visit]);
    }
  }

  for (const bucket of visitsByDay.values()) {
    bucket.sort(sortVisitsByRange);
  }

  return visitsByDay;
}

function buildCalendarDay(
  date: Date,
  anchorDate: Date,
  visitsByDay: Map<string, Visit[]>,
  todayIso: string,
): CalendarDay {
  const iso = formatDateOnlyUtc(date);

  return {
    iso,
    date,
    inCurrentMonth: date.getUTCMonth() === anchorDate.getUTCMonth(),
    isToday: iso === todayIso,
    visits: visitsByDay.get(iso) ?? [],
  };
}

function buildSegmentRows(
  days: CalendarDay[],
  visits: Visit[],
): CalendarSegment[][] {
  const weekStartIso = days[0]?.iso;
  const weekEndIso = days[days.length - 1]?.iso;

  if (!weekStartIso || !weekEndIso) {
    return [];
  }

  const segments = visits
    .filter((visit) => visitOverlapsRange(visit, weekStartIso, weekEndIso))
    .map((visit) => {
      const segmentStartIso =
        compareDateOnly(visit.dateFrom, weekStartIso) < 0
          ? weekStartIso
          : visit.dateFrom;
      const segmentEndIso =
        compareDateOnly(visit.dateTo, weekEndIso) > 0
          ? weekEndIso
          : visit.dateTo;

      return {
        key: `${visit.id}-${segmentStartIso}-${segmentEndIso}`,
        visit,
        startIndex: diffDateOnlyInDays(weekStartIso, segmentStartIso),
        span: diffDateOnlyInDays(segmentStartIso, segmentEndIso) + 1,
        continuesBefore: compareDateOnly(visit.dateFrom, weekStartIso) < 0,
        continuesAfter: compareDateOnly(visit.dateTo, weekEndIso) > 0,
      } satisfies CalendarSegment;
    })
    .sort(
      (left, right) =>
        left.startIndex - right.startIndex ||
        right.span - left.span ||
        sortVisitsByRange(left.visit, right.visit),
    );

  const rows: CalendarSegment[][] = [];
  const rowEndIndexes: number[] = [];

  for (const segment of segments) {
    let rowIndex = rowEndIndexes.findIndex(
      (rowEndIndex) => segment.startIndex > rowEndIndex,
    );

    if (rowIndex === -1) {
      rows.push([]);
      rowEndIndexes.push(-1);
      rowIndex = rows.length - 1;
    }

    rows[rowIndex]?.push(segment);
    rowEndIndexes[rowIndex] = segment.startIndex + segment.span - 1;
  }

  return rows;
}

function buildCalendarWeek(days: CalendarDay[], visits: Visit[]): CalendarWeek {
  return {
    key: days[0]?.iso ?? "week",
    days,
    rows: buildSegmentRows(days, visits),
  };
}

export function buildMonthWeeks({
  anchorIso,
  locale,
  visits,
  todayIso,
}: {
  anchorIso: string;
  locale: string;
  visits: Visit[];
  todayIso: string;
}): CalendarWeek[] {
  const anchorDate = parseDateOnlyUtc(anchorIso);
  const weekStartsOn = getLocaleWeekStartsOn(locale);
  const monthStart = startOfMonthUtc(anchorDate);
  const monthEnd = endOfMonthUtc(anchorDate);
  const gridStart = startOfWeekUtc(monthStart, weekStartsOn);
  const gridEnd = addDaysUtc(
    startOfWeekUtc(addDaysUtc(monthEnd, 6), weekStartsOn),
    6,
  );
  const gridStartIso = formatDateOnlyUtc(gridStart);
  const gridEndIso = formatDateOnlyUtc(gridEnd);
  const dayVisits = buildDayVisitsMap(
    visits,
    gridStartIso,
    gridEndIso,
  );
  const visibleVisits = visits.filter((visit) =>
    visitOverlapsRange(visit, gridStartIso, gridEndIso),
  );
  const days: CalendarDay[] = [];

  for (
    let cursor = gridStart;
    cursor.getTime() <= gridEnd.getTime();
    cursor = addDaysUtc(cursor, 1)
  ) {
    days.push(buildCalendarDay(cursor, anchorDate, dayVisits, todayIso));
  }

  const weeks: CalendarWeek[] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(buildCalendarWeek(days.slice(index, index + 7), visibleVisits));
  }

  return weeks;
}

export function buildWeek({
  anchorIso,
  locale,
  visits,
  todayIso,
}: {
  anchorIso: string;
  locale: string;
  visits: Visit[];
  todayIso: string;
}): CalendarWeek {
  const anchorDate = parseDateOnlyUtc(anchorIso);
  const weekStart = startOfWeekUtc(anchorDate, getLocaleWeekStartsOn(locale));
  const weekStartIso = formatDateOnlyUtc(weekStart);
  const weekEndIso = formatDateOnlyUtc(addDaysUtc(weekStart, 6));
  const dayVisits = buildDayVisitsMap(
    visits,
    weekStartIso,
    weekEndIso,
  );
  const visibleVisits = visits.filter((visit) =>
    visitOverlapsRange(visit, weekStartIso, weekEndIso),
  );
  const days = Array.from({ length: 7 }, (_, index) =>
    buildCalendarDay(
      addDaysUtc(weekStart, index),
      anchorDate,
      dayVisits,
      todayIso,
    ),
  );

  return buildCalendarWeek(days, visibleVisits);
}

export function getAgendaSections(
  visits: Visit[],
  anchorIso: string,
  locale: string,
): AgendaSection[] {
  const anchorDate = parseDateOnlyUtc(anchorIso);
  const monthStartIso = formatDateOnlyUtc(startOfMonthUtc(anchorDate));
  const monthEndIso = formatDateOnlyUtc(endOfMonthUtc(anchorDate));
  const sections = new Map<string, Visit[]>();

  for (const visit of visits) {
    if (!visitOverlapsRange(visit, monthStartIso, monthEndIso)) {
      continue;
    }

    const sectionKey =
      compareDateOnly(visit.dateFrom, monthStartIso) < 0
        ? monthStartIso
        : visit.dateFrom;
    const bucket = sections.get(sectionKey) ?? [];

    bucket.push(visit);
    sections.set(sectionKey, bucket);
  }

  return [...sections.entries()].map(([key, sectionVisits]) => ({
    key,
    label: formatVisitCompactDate(key, locale),
    visits: sectionVisits,
  }));
}

export function getMonthRangeLabel(anchorIso: string, locale: string): string {
  return formatVisitMonthLabel(anchorIso, locale);
}

export function getWeekRangeLabel(anchorIso: string, locale: string): string {
  const anchorDate = parseDateOnlyUtc(anchorIso);
  const weekStart = startOfWeekUtc(anchorDate, getLocaleWeekStartsOn(locale));
  const weekEnd = addDaysUtc(weekStart, 6);

  return formatVisitWeekRangeLabel(weekStart, weekEnd, locale);
}

export function getAnchorLabel(
  view: VisitsCalendarView,
  anchorIso: string,
  locale: string,
): string {
  if (view === "week") {
    return getWeekRangeLabel(anchorIso, locale);
  }

  return getMonthRangeLabel(anchorIso, locale);
}

function shiftMonthAnchor(anchorDate: Date, direction: -1 | 1): Date {
  return new Date(
    Date.UTC(
      anchorDate.getUTCFullYear(),
      anchorDate.getUTCMonth() + direction,
      1,
    ),
  );
}

export function shiftAnchor(
  view: VisitsCalendarView,
  anchorIso: string,
  direction: -1 | 1,
): string {
  const anchorDate = parseDateOnlyUtc(anchorIso);

  if (view === "week") {
    return formatDateOnlyUtc(addDaysUtc(anchorDate, direction * 7));
  }

  return formatDateOnlyUtc(shiftMonthAnchor(anchorDate, direction));
}
