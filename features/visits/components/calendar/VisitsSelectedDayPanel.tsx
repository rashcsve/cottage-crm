"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatVisitFullDate } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";
import { VisitCard } from "../visit/VisitCard";
import {
  getEmptyStateDescription,
  getNoDateDescription,
  getSelectedDayHint,
} from "./shared/day-panel-text";

const PANEL_SECTION_CLASS =
  "rounded-3xl border border-stone-200 bg-stone-50/70 p-4 shadow-sm sm:rounded-4xl sm:p-5";

const SURFACE_CARD_CLASS = "rounded-2xl bg-white shadow-sm";

const PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 sm:w-auto sm:self-start";


interface VisitsSelectedDayPanelProps {
  dateIso: string | null;
  visits: Visit[];
  isComposerOpen: boolean;
  canManageVisits: boolean;
  onAddVisit?: () => void;
  onDelete?: (visit: Visit) => void;
}

export function VisitsSelectedDayPanel({
  dateIso,
  visits,
  isComposerOpen,
  canManageVisits,
  onAddVisit,
  onDelete,
}: VisitsSelectedDayPanelProps) {
  const headingId = useId();
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  const selectedDateLabel = dateIso
    ? formatVisitFullDate(dateIso, locale)
    : null;
  const hasVisits = visits.length > 0;
  const canShowAddVisitButton =
    canManageVisits &&
    !isComposerOpen &&
    dateIso !== null &&
    onAddVisit !== undefined;
  const canShowDeleteActions = canManageVisits && onDelete !== undefined;
  const visitsCountLabel = tCalendar("visitsCount", { count: visits.length });

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

  if (!dateIso) {
    const noDateDescription = getNoDateDescription({
      isComposerOpen,
      t: tCalendar,
    });

    return (
      <section aria-labelledby={headingId} className={PANEL_SECTION_CLASS}>
        <div className={`${SURFACE_CARD_CLASS} px-4 py-5`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {tCalendar("selectedDay")}
          </p>
          <h3
            id={headingId}
            className="mt-2 text-lg font-semibold text-stone-900"
          >
            {tCalendar("chooseDayTitle")}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {noDateDescription}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} className={PANEL_SECTION_CLASS}>
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              {tCalendar("selectedDay")}
            </p>

            <div aria-live="polite" aria-atomic="true">
              <h3
                id={headingId}
                className="text-xl font-semibold leading-tight text-stone-900"
              >
                {selectedDateLabel}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="max-w-sm text-sm text-stone-500">
                {selectedDayHint}
              </p>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                {visitsCountLabel}
              </span>
            </div>
          </div>

          {canShowAddVisitButton ? (
            <button
              type="button"
              onClick={onAddVisit}
              aria-label={tCalendar("addVisitOnDay", {
                date: selectedDateLabel ?? "",
              })}
              className={PRIMARY_BUTTON_CLASS}
            >
              {tCalendar("addOnSelectedDay")}
            </button>
          ) : null}
        </header>

        {hasVisits ? (
          <ul className="space-y-2.5 sm:space-y-3" aria-labelledby={headingId}>
            {visits.map((visit) => (
              <li key={visit.id}>
                <VisitCard
                  visit={visit}
                  canManageVisits={canManageVisits}
                  onDelete={canShowDeleteActions ? onDelete : undefined}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-5">
            <h4 className="text-sm font-semibold text-stone-900">
              {tCalendar("noVisitsTitle")}
            </h4>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {emptyStateDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
