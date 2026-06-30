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
}): string {
  const rightBorderClassName = params.isLastDay
    ? "border-r-0"
    : "border-r-stone-200";
  const selectedStateClassName = params.isSelected ? "bg-stone-50/80" : "";

  return `group/day relative overflow-hidden border-y-0 border-l-0 border-r bg-white ${rightBorderClassName} ${selectedStateClassName}`.trim();
}

function getDayAriaLabel(params: {
  dateLabel: string;
  visitsCountLabel: string;
  isSelected: boolean;
  tCalendar: ReturnType<typeof useTranslations<"visits.calendar">>;
}): string {
  return [
    params.dateLabel,
    params.visitsCountLabel,
    params.isSelected ? params.tCalendar("selectedDay") : null,
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
      })}
    >
      <VisitsWeekDayHeader
        dayIso={day.iso}
        isToday={day.isToday}
        isSelected={isSelected}
        isInDraftRange={isInDraftRange}
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
