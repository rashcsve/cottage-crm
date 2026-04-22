"use client";

import { useId, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  CalendarDateRange,
  CalendarWeek,
} from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import type { Visit } from "../../../types/visits";
import { getGridNavigationIndex } from "../shared/grid-navigation";
import { VisitsWeekDayStrip } from "./VisitsWeekDayStrip";
import { VisitsWeekDayColumn } from "./VisitsWeekDayColumn";
import { VisitsWeekMobilePanel } from "./VisitsWeekMobilePanel";
import {
  buildTimelineRowsByDay,
  getActiveTabStopIso,
  getDayIndexByIso,
  getDayIsos,
  getSelectedDay,
} from "./visits-week-view";

const WEEK_GRID_COLUMN_COUNT = 7;
const WEEK_NAV_BUTTON_CLASS =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

interface VisitsWeekViewProps {
  week: CalendarWeek;
  anchorLabel: string;
  selectedDateIso: string | null;
  draftRange: CalendarDateRange | null;
  isComposerOpen: boolean;
  onAddVisit: (iso?: string) => void;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  canManageVisits: boolean;
  onDelete?: (visit: Visit) => void;
}

export function VisitsWeekView({
  week,
  anchorLabel,
  selectedDateIso,
  draftRange,
  isComposerOpen,
  onAddVisit,
  onSelectDay,
  onPreviousWeek,
  onNextWeek,
  canManageVisits,
  onDelete,
}: VisitsWeekViewProps) {
  const tCalendar = useTranslations("visits.calendar");
  const gridHintId = useId();
  const gridRef = useRef<HTMLDivElement>(null);

  const dayIsos = useMemo(() => getDayIsos(week), [week]);
  const dayIndexByIso = useMemo(() => getDayIndexByIso(dayIsos), [dayIsos]);
  const selectedDay = useMemo(
    () => getSelectedDay(week, selectedDateIso),
    [selectedDateIso, week],
  );
  const timelineRowsByDay = useMemo(() => buildTimelineRowsByDay(week), [week]);
  const activeTabStopIso = useMemo(
    () => getActiveTabStopIso(week, selectedDateIso),
    [selectedDateIso, week],
  );

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
      columnCount: WEEK_GRID_COLUMN_COUNT,
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
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-3 py-3 sm:px-4">
        <div
          className="flex items-center justify-between gap-3"
          role="group"
          aria-label={tCalendar("weekNavigation")}
        >
          <button
            type="button"
            onClick={onPreviousWeek}
            aria-label={tCalendar("previous")}
            className={WEEK_NAV_BUTTON_CLASS}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <p className="min-w-0 text-center text-sm font-semibold text-stone-900">
            {anchorLabel}
          </p>

          <button
            type="button"
            onClick={onNextWeek}
            aria-label={tCalendar("next")}
            className={WEEK_NAV_BUTTON_CLASS}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="lg:hidden" data-testid="week-mobile-view">
        <VisitsWeekDayStrip
          days={week.days}
          selectedDateIso={selectedDateIso}
          onSelectDay={onSelectDay}
        />

        <VisitsWeekMobilePanel
          day={selectedDay}
          isComposerOpen={isComposerOpen}
          canManageVisits={canManageVisits}
          onAddVisit={onAddVisit}
          onDelete={onDelete}
        />
      </div>

      <div className="hidden lg:block" data-testid="week-desktop-view">
        <div
          ref={gridRef}
          role="grid"
          aria-label={tCalendar("weekGrid")}
          aria-describedby={gridHintId}
          aria-colcount={WEEK_GRID_COLUMN_COUNT}
        >
          <p id={gridHintId} className="sr-only">
            {tCalendar("gridHint")}
          </p>

          <div role="row" className="grid grid-cols-7">
            {week.days.map((day, index) => (
              <VisitsWeekDayColumn
                key={day.iso}
                day={day}
                selectedDateIso={selectedDateIso}
                draftRange={draftRange}
                tabIndex={day.iso === activeTabStopIso ? 0 : -1}
                isComposerOpen={isComposerOpen}
                onAddVisit={onAddVisit}
                onSelectDay={onSelectDay}
                onDayKeyDown={handleDayKeyDown}
                timelineRows={timelineRowsByDay[index] ?? []}
                isLastDay={index === week.days.length - 1}
                canManageVisits={canManageVisits}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
