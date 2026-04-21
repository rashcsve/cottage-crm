"use client";

import { useId, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  CalendarDateRange,
  CalendarWeek,
} from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import { getGridNavigationIndex } from "../shared/grid-navigation";
import { VisitsMonthDayCell } from "./VisitsMonthDayCell";
import {
  buildTimelineRowsByWeek,
  buildWeekdayHeaderItems,
  getActiveTabStopIso,
  getDayIsos,
} from "./visits-month-view"

const MONTH_GRID_COLUMN_COUNT = 7;

interface VisitsMonthViewProps {
  weeks: CalendarWeek[];
  selectedDateIso: string | null;
  draftRange: CalendarDateRange | null;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
}

export function VisitsMonthView({
  weeks,
  selectedDateIso,
  draftRange,
  onSelectDay,
}: VisitsMonthViewProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");
  const gridHintId = useId();
  const gridRef = useRef<HTMLDivElement>(null);

  const weekdayHeaderItems = useMemo(() => {
    return buildWeekdayHeaderItems(weeks, locale);
  }, [weeks, locale]);

  const dayIsos = useMemo(() => getDayIsos(weeks), [weeks]);

  const dayIndexByIso = useMemo(() => {
    const indexByIso = new Map<string, number>();

    dayIsos.forEach((iso, index) => {
      indexByIso.set(iso, index);
    });

    return indexByIso;
  }, [dayIsos]);

  const timelineRowsByWeek = useMemo(() => {
    return buildTimelineRowsByWeek(weeks);
  }, [weeks]);

  const activeTabStopIso = useMemo(() => {
    return getActiveTabStopIso(weeks, selectedDateIso);
  }, [weeks, selectedDateIso]);

  function focusDay(iso: string) {
    const nextDayButton = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[data-day-iso="${iso}"]`
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
      columnCount: MONTH_GRID_COLUMN_COUNT,
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
    <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
      <div
        ref={gridRef}
        role="grid"
        aria-label={tCalendar("monthGrid")}
        aria-describedby={gridHintId}
        aria-colcount={MONTH_GRID_COLUMN_COUNT}
      >
        <p id={gridHintId} className="sr-only">
          {tCalendar("gridHint")}
        </p>

        <div
          role="row"
          className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80"
        >
          {weekdayHeaderItems.map((item) => (
            <div
              key={item.key}
              role="columnheader"
              className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 sm:px-3"
            >
              <span className="sm:hidden">{item.narrowLabel}</span>
              <span className="hidden sm:inline">{item.shortLabel}</span>
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div
            key={week.key}
            className="border-b border-stone-200 last:border-b-0"
          >
            <div role="rowgroup">
              <div role="row" className="grid grid-cols-7">
                {week.days.map((day, dayIndex) => (
                  <VisitsMonthDayCell
                    key={day.iso}
                    day={day}
                    selectedDateIso={selectedDateIso}
                    draftRange={draftRange}
                    timelineRows={
                      timelineRowsByWeek[weekIndex]?.[dayIndex] ?? []
                    }
                    tabIndex={day.iso === activeTabStopIso ? 0 : -1}
                    onSelectDay={onSelectDay}
                    onDayKeyDown={handleDayKeyDown}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
