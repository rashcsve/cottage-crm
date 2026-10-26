"use client";

import { type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  CalendarDateRange,
  CalendarDay,
  CalendarSegment,
} from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import {
  formatVisitDayNumber,
  formatVisitFullDate,
  formatVisitWeekdayShort,
} from "../../../shared/formatVisitDate";
import type { Visit } from "../../../types/visits";
import { isDateWithinRange } from "../../../domain/visits-calendar";
import { VisitsWeekDayHeader } from "./VisitsWeekDayHeader";
import { VisitsWeekDayContent } from "./VisitsWeekDayContent";

interface VisitsWeekTimelineRow {
  segment: CalendarSegment;
  isStart: boolean;
  isEnd: boolean;
}

interface VisitsWeekDayColumnProps {
  day: CalendarDay;
  selectedDateIso: string | null;
  draftRange: CalendarDateRange | null;
  tabIndex: number;
  isDraftMode: boolean;
  onAddVisit: (iso?: string) => void;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
  onDayKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement>,
    dayIso: string
  ) => void;
  timelineRows: Array<VisitsWeekTimelineRow | null>;
  isLastDay: boolean;
  canManageVisits: boolean;
  onDelete?: (visit: Visit) => void;
}

function getColumnClassName(params: {
  isLastDay: boolean;
  isSelected: boolean;
  isDraftBoundary: boolean;
}): string {
  const rightBorderClassName = params.isLastDay
    ? ""
    : "border-r border-border";
  const emphasisClassName =
    params.isSelected || params.isDraftBoundary
      ? "ring-2 ring-inset ring-accent"
      : "";

  return `group/day relative overflow-hidden bg-surface ${rightBorderClassName} ${emphasisClassName}`.trim();
}

function getDayAriaLabel(params: {
  dateLabel: string;
  visitsCountLabel: string;
  isSelected: boolean;
  isTinted: boolean;
  tCalendar: ReturnType<typeof useTranslations<"visits.calendar">>;
}): string {
  return [
    params.dateLabel,
    params.visitsCountLabel,
    params.isSelected ? params.tCalendar("selectedDay") : null,
    params.isTinted ? params.tCalendar("inDraftRange") : null,
  ]
    .filter(Boolean)
    .join(". ");
}

export function VisitsWeekDayColumn({
  day,
  selectedDateIso,
  draftRange,
  tabIndex,
  isDraftMode,
  onAddVisit,
  onSelectDay,
  onDayKeyDown,
  timelineRows,
  isLastDay,
  canManageVisits,
  onDelete,
}: VisitsWeekDayColumnProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  const isSelected = day.iso === selectedDateIso;
  const isInDraftRange = isDateWithinRange(day.iso, draftRange);
  const isDraftBoundary =
    draftRange?.dateFrom === day.iso || draftRange?.dateTo === day.iso;
  const isTinted = !isSelected && isInDraftRange;
  const dateLabel = formatVisitFullDate(day.date, locale);
  const weekdayLabel = formatVisitWeekdayShort(day.date, locale);
  const dayNumber = formatVisitDayNumber(day.date, locale);
  const visitsCountLabel = tCalendar("visitsCount", {
    count: day.visits.length,
  });
  const visitsCountShortLabel = tCalendar("visitsCountShort", {
    count: day.visits.length,
  });
  const ariaLabel = getDayAriaLabel({
    dateLabel,
    visitsCountLabel,
    isSelected,
    isTinted,
    tCalendar,
  });

  function handleSelectDay(extendRange: boolean) {
    onSelectDay({
      iso: day.iso,
      extendRange,
    });
  }

  return (
    <div
      role="gridcell"
      aria-selected={isSelected}
      className={getColumnClassName({
        isLastDay,
        isSelected,
        isDraftBoundary,
      })}
    >
      <VisitsWeekDayHeader
        dayIso={day.iso}
        isToday={day.isToday}
        isSelected={isSelected}
        isTinted={isTinted}
        isDraftBoundary={isDraftBoundary}
        dayLabel={weekdayLabel}
        dayNumber={dayNumber}
        visitsCountLabel={visitsCountLabel}
        visitsCountShortLabel={visitsCountShortLabel}
        ariaLabel={ariaLabel}
        tabIndex={tabIndex}
        onSelectDay={handleSelectDay}
        onDayKeyDown={onDayKeyDown}
      />

      <VisitsWeekDayContent
        dayIso={day.iso}
        dateLabel={dateLabel}
        visits={day.visits}
        isSelected={isSelected}
        isDraftMode={isDraftMode}
        canManageVisits={canManageVisits}
        onAddVisit={onAddVisit}
        onSelectDay={onSelectDay}
        timelineRows={timelineRows}
        onDelete={onDelete}
      />
    </div>
  );
}
