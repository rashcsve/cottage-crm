"use client";

import { useId, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type {
  CalendarDateRange,
  CalendarWeek,
} from "../../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import type { Visit } from "../../../types/visits";
import { Surface } from "@/shared/ui/Surface";
import { getGridNavigationIndex } from "../shared/grid-navigation";
import { VisitsWeekDayStrip } from "./VisitsWeekDayStrip";
import { VisitsWeekDayColumn } from "./VisitsWeekDayColumn";
import { VisitsWeekMobilePanel } from "./VisitsWeekMobilePanel";
import { VisitsWeekTimeline } from "./VisitsWeekTimeline";
import {
  getActiveTabStopIso,
  getDayIndexByIso,
  getDayIsos,
  getSelectedDay,
  getWeekColumnSpanClass,
  getWeekColumnStartClass,
  getWeekHighlightSpan,
} from "./visits-week-view";

const WEEK_GRID_COLUMN_COUNT = 7;

interface VisitsWeekViewProps {
  week: CalendarWeek;
  selectedDateIso: string | null;
  draftRange: CalendarDateRange | null;
  isDraftMode: boolean;
  onAddVisit: (iso?: string) => void;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
  canManageVisits: boolean;
  onDelete?: (visit: Visit) => void;
}

export function VisitsWeekView({
  week,
  selectedDateIso,
  draftRange,
  isDraftMode,
  onAddVisit,
  onSelectDay,
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
  const highlightSpan = useMemo(
    () => getWeekHighlightSpan(dayIsos, selectedDateIso, draftRange),
    [dayIsos, draftRange, selectedDateIso],
  );
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
    <Surface as="section" className="overflow-clip">
      <div className="lg:hidden" data-testid="week-mobile-view">
        <VisitsWeekDayStrip
          days={week.days}
          selectedDateIso={selectedDateIso}
          onSelectDay={onSelectDay}
        />

        <VisitsWeekMobilePanel
          day={selectedDay}
          isDraftMode={isDraftMode}
          canManageVisits={canManageVisits}
          onAddVisit={onAddVisit}
          onDelete={onDelete}
        />
      </div>

      <div className="isolate hidden lg:block" data-testid="week-desktop-view">
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

          <div
            role="row"
            className="grid grid-cols-7 grid-rows-[auto_auto_1fr]"
          >
            {week.days.map((day, index) => (
              <VisitsWeekDayColumn
                key={day.iso}
                day={day}
                selectedDateIso={selectedDateIso}
                draftRange={draftRange}
                tabIndex={day.iso === activeTabStopIso ? 0 : -1}
                isDraftMode={isDraftMode}
                onAddVisit={onAddVisit}
                onSelectDay={onSelectDay}
                onDayKeyDown={handleDayKeyDown}
                columnIndex={index}
                isLastDay={index === week.days.length - 1}
                canManageVisits={canManageVisits}
                onDelete={onDelete}
              />
            ))}

            <VisitsWeekTimeline rows={week.rows} />

            {highlightSpan && (
              <div
                aria-hidden="true"
                className={`pointer-events-none relative z-20 row-span-3 row-start-1 ${getWeekColumnStartClass(highlightSpan.startIndex)} ${getWeekColumnSpanClass(highlightSpan.span)} ring-2 ring-inset ring-accent`}
              />
            )}
          </div>
        </div>
      </div>
    </Surface>
  );
}
