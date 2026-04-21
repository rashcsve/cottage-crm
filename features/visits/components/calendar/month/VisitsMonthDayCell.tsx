"use client";

import type { KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  CalendarDateRange,
  CalendarDay,
  CalendarSegment,
} from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import { isDateWithinRange } from "../../../domain/visits-calendar";
import {
  formatVisitDayNumber,
  formatVisitFullDate,
} from "../../../shared/formatVisitDate";
import { VISIT_STATUS_TONE_CLASS } from "../shared/visit-status-tone";

const MAX_VISIBLE_TIMELINE_ROWS = 2;
const TIMELINE_ROW_SLOTS = [0, 1] as const;

const DAY_BUTTON_BASE_CLASS =
  "flex min-h-[4.75rem] w-full flex-col justify-between px-1.5 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900 sm:min-h-[6.25rem] sm:px-2.5 sm:py-2 lg:min-h-[7rem]";

const DAY_NUMBER_BASE_CLASS =
  "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1 text-xs font-semibold sm:h-8 sm:min-w-8 sm:text-sm";

const TIMELINE_ROW_BASE_CLASS =
  "-mx-1.5 flex h-[18px] items-center px-1 text-[9px] font-medium leading-none sm:-mx-2.5 sm:h-5 sm:px-1.5 sm:text-[10px]";

const EMPTY_TIMELINE_ROW_CLASS = "h-[18px] rounded-full bg-transparent sm:h-5";

interface MonthTimelineRow {
  segment: CalendarSegment;
  isStart: boolean;
  isEnd: boolean;
}

interface VisitsMonthDayCellProps {
  day: CalendarDay;
  selectedDateIso: string | null;
  draftRange: CalendarDateRange | null;
  timelineRows: Array<MonthTimelineRow | null>;
  tabIndex: number;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
  onDayKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement>,
    dayIso: string
  ) => void;
}

function getTimelineLabel(
  segment: CalendarSegment,
  isStart: boolean,
  isEnd: boolean
) {
  const prefix = segment.continuesBefore && isStart ? "... " : "";
  const suffix = segment.continuesAfter && isEnd ? " ..." : "";

  return `${prefix}${segment.visit.visitorName}${suffix}`;
}

function getButtonClassName(params: {
  inCurrentMonth: boolean;
  isInDraftRange: boolean;
  isSelected: boolean;
  isDraftBoundary: boolean;
}) {
  let surfaceClassName = "bg-stone-50/70";
  let backgroundClassName = "";
  let emphasisClassName = "";
  let interactionClassName = "hover:bg-stone-50";

  if (params.inCurrentMonth) {
    surfaceClassName = "bg-white";
  }

  if (params.isSelected) {
    backgroundClassName = "bg-stone-50";
    emphasisClassName = "ring-2 ring-inset ring-stone-900";
    interactionClassName = "";
  } else {
    if (params.isInDraftRange) {
      backgroundClassName = "bg-amber-50/80";
    }

    if (params.isDraftBoundary) {
      emphasisClassName = "ring-1 ring-inset ring-amber-700/35";
    }
  }

  return `${DAY_BUTTON_BASE_CLASS} ${surfaceClassName} ${backgroundClassName} ${emphasisClassName} ${interactionClassName}`.trim();
}

function getDayNumberClassName(params: {
  isSelected: boolean;
  isToday: boolean;
  inCurrentMonth: boolean;
}) {
  let stateClassName = "text-stone-400";

  if (params.isSelected) {
    stateClassName = "bg-stone-900 text-white";
  } else if (params.isToday) {
    stateClassName = "bg-white text-stone-900 ring-1 ring-stone-300";
  } else if (params.inCurrentMonth) {
    stateClassName = "text-stone-900";
  }

  return `${DAY_NUMBER_BASE_CLASS} ${stateClassName}`.trim();
}

function getTimelineShapeClassName(row: MonthTimelineRow) {
  if (row.isStart && row.isEnd) {
    return "rounded-full";
  }

  if (row.isStart) {
    return "rounded-l-full rounded-r-sm";
  }

  if (row.isEnd) {
    return "rounded-r-full rounded-l-sm";
  }

  return "";
}

function getTimelineOverlapClassName(row: MonthTimelineRow) {
  if (row.isStart && !row.isEnd) {
    return "mr-[-1px]";
  }

  if (!row.isStart && row.isEnd) {
    return "ml-[-1px]";
  }

  if (!row.isStart && !row.isEnd) {
    return "-mx-px";
  }

  return "";
}

function getTimelineRowClassName(row: MonthTimelineRow) {
  const shapeClassName = getTimelineShapeClassName(row);
  const overlapClassName = getTimelineOverlapClassName(row);
  const toneClassName = VISIT_STATUS_TONE_CLASS[row.segment.visit.status];

  return `${TIMELINE_ROW_BASE_CLASS} ${shapeClassName} ${overlapClassName} ${toneClassName}`.trim();
}

function getTimelineDisplayData(timelineRows: Array<MonthTimelineRow | null>): {
  visibleRows: Array<MonthTimelineRow | null>;
  overflowCount: number;
} {
  const visibleRows = timelineRows.slice(0, MAX_VISIBLE_TIMELINE_ROWS);
  let overflowCount = 0;

  for (
    let index = MAX_VISIBLE_TIMELINE_ROWS;
    index < timelineRows.length;
    index += 1
  ) {
    if (timelineRows[index]) {
      overflowCount += 1;
    }
  }

  return {
    visibleRows,
    overflowCount,
  };
}

interface VisitsMonthTimelineRowProps {
  row: MonthTimelineRow | null;
}

function VisitsMonthTimelineRow({ row }: VisitsMonthTimelineRowProps) {
  if (!row) {
    return <div className={EMPTY_TIMELINE_ROW_CLASS} />;
  }

  const label = getTimelineLabel(row.segment, row.isStart, row.isEnd);

  return (
    <div className={getTimelineRowClassName(row)} title={label}>
      <span className="truncate">{label}</span>
    </div>
  );
}

export function VisitsMonthDayCell({
  day,
  selectedDateIso,
  draftRange,
  timelineRows,
  tabIndex,
  onSelectDay,
  onDayKeyDown,
}: VisitsMonthDayCellProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  const isSelected = day.iso === selectedDateIso;
  const isInDraftRange = isDateWithinRange(day.iso, draftRange);
  const isDraftBoundary =
    draftRange?.dateFrom === day.iso || draftRange?.dateTo === day.iso;

  const dateLabel = formatVisitFullDate(day.date, locale);
  const dayNumber = formatVisitDayNumber(day.date, locale);
  const visitsCountLabel = tCalendar("visitsCount", {
    count: day.visits.length,
  });

  const { visibleRows, overflowCount } = getTimelineDisplayData(timelineRows);

  const ariaLabel = [
    dateLabel,
    visitsCountLabel,
    isSelected ? tCalendar("selectedDay") : null,
  ]
    .filter(Boolean)
    .join(". ");

  function handleClick(extendRange: boolean) {
    onSelectDay({
      iso: day.iso,
      extendRange,
    });
  }

  return (
    <div
      role="gridcell"
      aria-selected={isSelected}
      className="border-r border-stone-200 last:border-r-0"
    >
      <button
        type="button"
        onClick={(event) => handleClick(event.shiftKey)}
        onKeyDown={(event) => onDayKeyDown?.(event, day.iso)}
        className={getButtonClassName({
          inCurrentMonth: day.inCurrentMonth,
          isInDraftRange,
          isSelected,
          isDraftBoundary,
        })}
        tabIndex={tabIndex}
        data-day-iso={day.iso}
        aria-current={day.isToday ? "date" : undefined}
        aria-label={ariaLabel}
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className={getDayNumberClassName({
              isSelected,
              isToday: day.isToday,
              inCurrentMonth: day.inCurrentMonth,
            })}
          >
            {dayNumber}
          </span>

          {day.visits.length > 0 ? (
            <span className="rounded-full border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-stone-500 shadow-sm sm:px-2 sm:text-[11px] sm:text-stone-600">
              {day.visits.length}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex-1">
          <div className="space-y-1.5" aria-hidden="true">
            {TIMELINE_ROW_SLOTS.map((rowIndex) => (
              <VisitsMonthTimelineRow
                key={`month-row-${day.iso}-${rowIndex}`}
                row={visibleRows[rowIndex] ?? null}
              />
            ))}
          </div>

          {overflowCount > 0 ? (
            <p className="mt-1 text-[11px] font-medium text-stone-400">
              +{overflowCount}
            </p>
          ) : null}
        </div>
      </button>
    </div>
  );
}
