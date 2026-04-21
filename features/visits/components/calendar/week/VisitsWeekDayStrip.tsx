"use client";

import { useId, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CalendarDay } from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import {
  formatVisitDayNumber,
  formatVisitFullDate,
} from "../../../shared/formatVisitDate";
import { getGridNavigationIndex } from "../shared/grid-navigation";

const WEEK_DAY_PICKER_COLUMN_COUNT = 7;

const DAY_BUTTON_BASE_CLASS =
  "min-w-[4.75rem] snap-start rounded-2xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

function getActiveTabStopIso(
  days: CalendarDay[],
  selectedDateIso: string | null
): string | null {
  if (selectedDateIso && days.some((day) => day.iso === selectedDateIso)) {
    return selectedDateIso;
  }

  return days[0]?.iso ?? null;
}

function getDayButtonClassName(params: {
  isSelected: boolean;
  isToday: boolean;
}): string {
  let stateClassName =
    "border-stone-200 bg-white text-stone-900 hover:bg-stone-50";

  if (params.isSelected) {
    stateClassName = "border-stone-900 bg-stone-900 text-white shadow-sm";
  } else if (params.isToday) {
    stateClassName = "border-stone-300 bg-stone-50 text-stone-900";
  }

  return `${DAY_BUTTON_BASE_CLASS} ${stateClassName}`;
}

function getWeekdayLabelClassName(isSelected: boolean): string {
  if (isSelected) {
    return "text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70";
  }

  return "text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500";
}

function getVisitsCountClassName(isSelected: boolean): string {
  if (isSelected) {
    return "truncate text-xs text-white/80";
  }

  return "truncate text-xs text-stone-500";
}

function getVisitsIndicatorClassName(params: {
  hasVisits: boolean;
  isSelected: boolean;
}): string {
  if (!params.hasVisits) {
    return "block h-1 rounded-full bg-transparent";
  }

  if (params.isSelected) {
    return "block h-1 rounded-full bg-white/30";
  }

  return "block h-1 rounded-full bg-stone-200";
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

  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        timeZone: "UTC",
      }),
    [locale]
  );

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
    <div className="border-b border-stone-200 px-3 py-3">
      <div
        ref={stripRef}
        role="group"
        aria-label={tCalendar("weekDayPicker")}
        aria-describedby={pickerHintId}
        className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1"
      >
        <p id={pickerHintId} className="sr-only">
          {tCalendar("gridHint")}
        </p>

        {days.map((day) => {
          const isSelected = day.iso === selectedDateIso;
          const weekdayLabel = weekdayFormatter.format(day.date);
          const dayNumber = formatVisitDayNumber(day.date, locale);
          const fullDateLabel = formatVisitFullDate(day.date, locale);
          const visitsCountLabel = tCalendar("visitsCount", {
            count: day.visits.length,
          });
          const visitsCountShortLabel = tCalendar("visitsCountShort", {
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
              className={getDayButtonClassName({
                isSelected,
                isToday: day.isToday,
              })}
            >
              <div className="space-y-1.5">
                <p className={getWeekdayLabelClassName(isSelected)}>
                  {weekdayLabel}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold leading-none">
                    {dayNumber}
                  </span>

                  {day.isToday && !isSelected ? (
                    <span
                      aria-hidden="true"
                      className="inline-flex h-2.5 w-2.5 rounded-full bg-stone-900"
                    />
                  ) : null}
                </div>

                <p
                  className={getVisitsCountClassName(isSelected)}
                  title={visitsCountLabel}
                >
                  {visitsCountShortLabel}
                </p>

                <span
                  aria-hidden="true"
                  className={getVisitsIndicatorClassName({
                    hasVisits: day.visits.length > 0,
                    isSelected,
                  })}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
