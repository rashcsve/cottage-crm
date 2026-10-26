"use client";

import { useId, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CalendarDay } from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import {
  formatVisitDayNumber,
  formatVisitFullDate,
  formatVisitWeekdayShort,
} from "../../../shared/formatVisitDate";
import { getGridNavigationIndex } from "../shared/grid-navigation";

const WEEK_DAY_PICKER_COLUMN_COUNT = 7;

const DAY_BUTTON_BASE_CLASS =
  "relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 px-0.5 pb-2 pt-2.5 text-center transition-colors before:absolute before:inset-x-1.5 before:top-0 before:h-0.75 focus-inset";

const DAY_NUMBER_BASE_CLASS =
  "inline-flex size-7 items-center justify-center rounded-control font-mono text-sm font-semibold leading-none tracking-data";

function getActiveTabStopIso(
  days: CalendarDay[],
  selectedDateIso: string | null
): string | null {
  if (selectedDateIso && days.some((day) => day.iso === selectedDateIso)) {
    return selectedDateIso;
  }

  return days[0]?.iso ?? null;
}

function getDayButtonClassName(isSelected: boolean): string {
  return isSelected
    ? `${DAY_BUTTON_BASE_CLASS} font-semibold text-accent before:bg-accent`
    : `${DAY_BUTTON_BASE_CLASS} font-medium text-ink-secondary hover:text-ink-primary`;
}

function getDayNumberClassName(isToday: boolean): string {
  return isToday
    ? `${DAY_NUMBER_BASE_CLASS} bg-accent text-on-accent`
    : DAY_NUMBER_BASE_CLASS;
}

function getVisitsIndicatorClassName(hasVisits: boolean): string {
  return hasVisits
    ? "block size-1.5 rounded-full bg-ink-secondary"
    : "block size-1.5";
}

function getDayAriaLabel(params: {
  fullDateLabel: string;
  visitsCountLabel: string;
  isSelected: boolean;
  tCalendar: ReturnType<typeof useTranslations>;
}): string {
  return [
    params.fullDateLabel,
    params.visitsCountLabel,
    params.isSelected ? params.tCalendar("selectedDay") : null,
  ]
    .filter(Boolean)
    .join(". ");
}

interface VisitsWeekDayStripProps {
  days: CalendarDay[];
  selectedDateIso: string | null;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
}

export function VisitsWeekDayStrip({
  days,
  selectedDateIso,
  onSelectDay,
}: VisitsWeekDayStripProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");
  const pickerHintId = useId();
  const stripRef = useRef<HTMLDivElement>(null);

  const dayIsos = useMemo(() => days.map((day) => day.iso), [days]);
  const dayIndexByIso = useMemo(
    () => new Map(dayIsos.map((iso, index) => [iso, index])),
    [dayIsos],
  );
  const activeTabStopIso = useMemo(
    () => getActiveTabStopIso(days, selectedDateIso),
    [days, selectedDateIso],
  );

  function focusDay(iso: string) {
    const nextDayButton = stripRef.current?.querySelector<HTMLButtonElement>(
      `button[data-week-mobile-day-iso="${iso}"]`
    );

    nextDayButton?.focus();
  }

  function handleDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    dayIso: string
  ) {
    const currentIndex = dayIndexByIso.get(dayIso);

    if (currentIndex === undefined) {
      return;
    }

    const nextIndex = getGridNavigationIndex({
      key: event.key,
      currentIndex,
      itemCount: dayIsos.length,
      columnCount: WEEK_DAY_PICKER_COLUMN_COUNT,
    });

    if (nextIndex === null) {
      return;
    }

    const nextIso = dayIsos[nextIndex];

    if (!nextIso) {
      return;
    }

    event.preventDefault();

    onSelectDay({
      iso: nextIso,
      extendRange: event.shiftKey,
    });

    focusDay(nextIso);
  }

  return (
    <div className="border-b border-border">
      <div
        ref={stripRef}
        role="group"
        aria-label={tCalendar("weekDayPicker")}
        aria-describedby={pickerHintId}
        className="grid grid-cols-7"
      >
        <p id={pickerHintId} className="sr-only">
          {tCalendar("gridHint")}
        </p>

        {days.map((day) => {
          const isSelected = day.iso === selectedDateIso;
          const weekdayLabel = formatVisitWeekdayShort(day.date, locale);
          const dayNumber = formatVisitDayNumber(day.date, locale);
          const fullDateLabel = formatVisitFullDate(day.date, locale);
          const visitsCountLabel = tCalendar("visitsCount", {
            count: day.visits.length,
          });
          const ariaLabel = getDayAriaLabel({
            fullDateLabel,
            visitsCountLabel,
            isSelected,
            tCalendar,
          });

          return (
            <button
              key={day.iso}
              type="button"
              aria-current={day.isToday ? "date" : undefined}
              aria-pressed={isSelected}
              aria-label={ariaLabel}
              tabIndex={day.iso === activeTabStopIso ? 0 : -1}
              data-week-mobile-day-iso={day.iso}
              onClick={() =>
                onSelectDay({
                  iso: day.iso,
                  extendRange: false,
                })
              }
              onKeyDown={(event) => handleDayKeyDown(event, day.iso)}
              className={getDayButtonClassName(isSelected)}
            >
              <span className="text-xs capitalize">{weekdayLabel}</span>
              <span className={getDayNumberClassName(day.isToday)}>
                {dayNumber}
              </span>
              <span
                aria-hidden="true"
                className={getVisitsIndicatorClassName(day.visits.length > 0)}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
