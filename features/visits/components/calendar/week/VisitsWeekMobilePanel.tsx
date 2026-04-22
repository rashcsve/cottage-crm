"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CalendarDay } from "../../../domain/visits-calendar-types";
import { formatVisitFullDate } from "../../../shared/formatVisitDate";
import type { Visit } from "../../../types/visits";
import { VisitCard } from "../../visit/VisitCard";
import {
  getEmptyStateDescription,
  getNoDateDescription,
  getSelectedDayHint,
} from "../shared/day-panel-text";

const PANEL_SECTION_CLASS = "border-t border-stone-200 bg-stone-50/70 p-4";
const SURFACE_CARD_CLASS = "rounded-2xl bg-white shadow-sm";
const PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

interface VisitsWeekMobilePanelProps {
  day: CalendarDay | null;
  isComposerOpen: boolean;
  canManageVisits: boolean;
  onAddVisit: (iso?: string) => void;
  onDelete?: (visit: Visit) => void;
}

function getHintContainerClassName(isComposerOpen: boolean) {
  if (isComposerOpen) {
    return "rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3";
  }

  return `${SURFACE_CARD_CLASS} px-3.5 py-3`;
}

function getHintTextClassName(isComposerOpen: boolean) {
  if (isComposerOpen) {
    return "text-sm leading-5 text-amber-900";
  }

  return "text-sm leading-5 text-stone-600";
}

export function VisitsWeekMobilePanel({
  day,
  isComposerOpen,
  canManageVisits,
  onAddVisit,
  onDelete,
}: VisitsWeekMobilePanelProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  if (!day) {
    const noDayDescription = getNoDateDescription({
      isComposerOpen,
      t: tCalendar,
    });

    return (
      <section className={PANEL_SECTION_CLASS}>
        <div className={`${SURFACE_CARD_CLASS} px-4 py-5`}>
          <h3 className="text-base font-semibold text-stone-900">
            {tCalendar("chooseDayTitle")}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {noDayDescription}
          </p>
        </div>
      </section>
    );
  }

  const selectedDateLabel = formatVisitFullDate(day.date, locale);
  const visitsCountLabel = tCalendar("visitsCount", {
    count: day.visits.length,
  });
  const canShowDeleteActions = canManageVisits && onDelete !== undefined;
  const canAddVisitOnSelectedDay = canManageVisits && !isComposerOpen;
  const selectedDayHint = getSelectedDayHint({
    isComposerOpen,
    canManageVisits,
    t: tCalendar,
  });
  const emptyStateDescription = getEmptyStateDescription({
    isComposerOpen,
    canManageVisits,
    t: tCalendar,
  });

  return (
    <section className={PANEL_SECTION_CLASS}>
      <div className="space-y-4">
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {tCalendar("selectedDay")}
              </p>
              <h3 className="text-lg font-semibold leading-tight text-stone-900">
                {selectedDateLabel}
              </h3>
            </div>

            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
              {visitsCountLabel}
            </span>
          </div>

          {canAddVisitOnSelectedDay ? (
            <button
              type="button"
              onClick={() => onAddVisit(day.iso)}
              aria-label={tCalendar("addVisitOnDay", {
                date: selectedDateLabel,
              })}
              className={PRIMARY_BUTTON_CLASS}
            >
              {tCalendar("addOnSelectedDay")}
            </button>
          ) : (
            <div className={getHintContainerClassName(isComposerOpen)}>
              <p className={getHintTextClassName(isComposerOpen)}>
                {selectedDayHint}
              </p>
            </div>
          )}
        </header>

        {day.visits.length > 0 ? (
          <ul className="space-y-2.5">
            {day.visits.map((visit) => (
              <li key={visit.id}>
                <VisitCard
                  visit={visit}
                  compact
                  canManageVisits={canManageVisits}
                  onDelete={canShowDeleteActions ? onDelete : undefined}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={`${SURFACE_CARD_CLASS} px-4 py-4 text-sm leading-6 text-stone-600`}
          >
            {emptyStateDescription}
          </div>
        )}
      </div>
    </section>
  );
}
