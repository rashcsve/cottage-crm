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
  getCoupleColorClasses,
  getVisitCoupleLabel,
} from "../../../domain/couples";
import {
  formatVisitDayNumber,
  formatVisitFullDate,
} from "../../../shared/formatVisitDate";
const MAX_VISIBLE_TIMELINE_ROWS = 2;
const TIMELINE_ROW_SLOTS = [0, 1] as const;

const DAY_BUTTON_BASE_CLASS =
  "flex h-full min-h-11 w-full flex-col justify-between px-1.5 py-1.5 text-left transition-colors focus-visible:-outline-offset-6 sm:px-2.5 sm:py-2 lg:min-h-22 lg:py-1.5";

const DAY_NUMBER_BASE_CLASS =
  "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-control px-1 font-mono text-sm font-semibold tracking-data sm:h-8 sm:min-w-8 lg:h-7 lg:min-w-7";

const TIMELINE_ROW_BASE_CLASS =
  "-mx-1.5 flex h-5 items-center px-1 text-xs font-medium leading-none text-ink-primary sm:-mx-2.5 sm:px-1.5";

const EMPTY_TIMELINE_ROW_CLASS = "h-5";

const DRAFT_RANGE_BAND_CLASS = "range-band";

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
  mobileTimelineRowCount?: number;
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
  isTinted: boolean;
  isSelected: boolean;
  isDraftBoundary: boolean;
}) {
  let surfaceClassName = "bg-page hover:bg-surface";
  let emphasisClassName = "";

  if (params.inCurrentMonth) {
    surfaceClassName = "bg-surface hover:bg-page";
  }

  if (params.isTinted) {
    surfaceClassName = "bg-muted";
  }

  if (params.isSelected || params.isDraftBoundary) {
    emphasisClassName = "ring-2 ring-inset ring-accent";
  } else if (params.isTinted) {
    emphasisClassName = DRAFT_RANGE_BAND_CLASS;
  }

  return `${DAY_BUTTON_BASE_CLASS} ${surfaceClassName} ${emphasisClassName}`.trim();
}

function getDayNumberClassName(params: {
  isSelected: boolean;
  isToday: boolean;
  inCurrentMonth: boolean;
}) {
  let stateClassName = "text-ink-muted";

  if (params.isSelected && params.isToday) {
    stateClassName = "bg-accent text-on-accent outline outline-2 -outline-offset-2 outline-on-accent lg:outline-0";
  } else if (params.isSelected) {
    stateClassName = "bg-accent text-on-accent lg:bg-transparent lg:text-ink-primary";
  } else if (params.isToday) {
    stateClassName = "text-ink-primary outline outline-2 outline-accent lg:bg-accent lg:text-on-accent lg:outline-0";
  } else if (params.inCurrentMonth) {
    stateClassName = "text-ink-primary";
  }

  return `${DAY_NUMBER_BASE_CLASS} ${stateClassName}`.trim();
}

function getTimelineShapeClassName(row: MonthTimelineRow) {
  if (row.isStart && row.isEnd) {
    return "rounded-control";
  }

  if (row.isStart) {
    return "rounded-l-control";
  }

  if (row.isEnd) {
    return "rounded-r-control";
  }

  return "";
}

function getTimelineOverlapClassName(row: MonthTimelineRow) {
  if (row.isStart && !row.isEnd) {
    return "-mr-px";
  }

  if (!row.isStart && row.isEnd) {
    return "-ml-px";
  }

  if (!row.isStart && !row.isEnd) {
    return "-mx-px";
  }

  return "";
}

function getTimelineRowClassName(row: MonthTimelineRow) {
  const shapeClassName = getTimelineShapeClassName(row);
  const overlapClassName = getTimelineOverlapClassName(row);
  const fillClassName = getCoupleColorClasses(row.segment.visit.couple).fill;

  return `${TIMELINE_ROW_BASE_CLASS} ${shapeClassName} ${overlapClassName} ${fillClassName}`.trim();
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
  noCoupleLabel: string;
}

function VisitsMonthTimelineRow({ row, noCoupleLabel }: VisitsMonthTimelineRowProps) {
  if (!row) {
    return <div className={EMPTY_TIMELINE_ROW_CLASS} />;
  }

  const label = getTimelineLabel(row.segment, row.isStart, row.isEnd);
  const coupleLabel = getVisitCoupleLabel(row.segment.visit, noCoupleLabel);

  return (
    <div
      className={getTimelineRowClassName(row)}
      title={[label, coupleLabel].filter(Boolean).join(" · ")}
    >
      <span className="truncate">{label}</span>
    </div>
  );
}

export function VisitsMonthDayCell({
  day,
  selectedDateIso,
  draftRange,
  timelineRows,
  mobileTimelineRowCount = MAX_VISIBLE_TIMELINE_ROWS,
  tabIndex,
  onSelectDay,
  onDayKeyDown,
}: VisitsMonthDayCellProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");
  const tMeta = useTranslations("visits.meta");

  const isSelected = day.iso === selectedDateIso;
  const isInDraftRange = isDateWithinRange(day.iso, draftRange);
  const isDraftBoundary =
    draftRange?.dateFrom === day.iso || draftRange?.dateTo === day.iso;
  const isTinted = !isSelected && isInDraftRange;

  const dateLabel = formatVisitFullDate(day.date, locale);
  const dayNumber = formatVisitDayNumber(day.date, locale);
  const visitsCountLabel = tCalendar("visitsCount", {
    count: day.visits.length,
  });

  const { visibleRows, overflowCount } = getTimelineDisplayData(timelineRows);

  const noCoupleLabel = tMeta("noCouple");

  const visitsLabel = day.visits
    .map((visit) => {
      const coupleLabel = getVisitCoupleLabel(visit, noCoupleLabel);

      return coupleLabel
        ? `${visit.visitorName} (${coupleLabel})`
        : visit.visitorName;
    })
    .join(", ");

  const ariaLabel = [
    dateLabel,
    visitsCountLabel,
    visitsLabel,
    isSelected ? tCalendar("selectedDay") : null,
    isTinted ? tCalendar("inDraftRange") : null,
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
      className="border-border lg:flex lg:border-r lg:last:border-r-0"
    >
      <button
        type="button"
        onClick={(event) => handleClick(event.shiftKey)}
        onKeyDown={(event) => onDayKeyDown?.(event, day.iso)}
        className={getButtonClassName({
          inCurrentMonth: day.inCurrentMonth,
          isTinted,
          isSelected,
          isDraftBoundary,
        })}
        tabIndex={tabIndex}
        data-day-iso={day.iso}
        aria-current={day.isToday ? "date" : undefined}
        aria-label={ariaLabel}
      >
        <div className="flex items-start">
          <span
            className={getDayNumberClassName({
              isSelected,
              isToday: day.isToday,
              inCurrentMonth: day.inCurrentMonth,
            })}
          >
            {dayNumber}
          </span>
        </div>

        <div className={mobileTimelineRowCount === 0 ? "hidden lg:mt-1 lg:block lg:flex-1" : "mt-1 flex-1"}>
          <div className="flex flex-col gap-1.5 lg:gap-1" aria-hidden="true">
            {TIMELINE_ROW_SLOTS.map((rowIndex) => (
              <div
                key={`month-row-${day.iso}-${rowIndex}`}
                className={rowIndex >= mobileTimelineRowCount ? "hidden lg:block" : undefined}
              >
                <VisitsMonthTimelineRow
                  row={visibleRows[rowIndex] ?? null}
                  noCoupleLabel={noCoupleLabel}
                />
              </div>
            ))}
          </div>

          {overflowCount > 0 ? (
            <p className="mt-1 font-mono text-xs text-ink-muted">
              +{overflowCount}
            </p>
          ) : null}
        </div>
      </button>
    </div>
  );
}
