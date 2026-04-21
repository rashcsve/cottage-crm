import type { Visit } from "../types/visits";

export const VISITS_CALENDAR_VIEWS = ["month", "week", "agenda"] as const;

export type VisitsCalendarView = (typeof VISITS_CALENDAR_VIEWS)[number];

export interface CalendarDay {
  iso: string;
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  visits: Visit[];
}

export interface CalendarDateRange {
  dateFrom: string;
  dateTo: string;
}

export interface CalendarSegment {
  key: string;
  visit: Visit;
  startIndex: number;
  span: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export interface CalendarWeek {
  key: string;
  days: CalendarDay[];
  rows: CalendarSegment[][];
}
