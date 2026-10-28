"use client";

import { useId } from "react";
import { Info, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList } from "@/shared/ui/RowList";
import { Surface } from "@/shared/ui/Surface";
import { formatVisitFullDate } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";
import { VisitRow } from "../visit/VisitRow";
import {
  getEmptyStateDescription,
  getNoDateDescription,
  getSelectedDayHint,
} from "./shared/day-panel-text";

const PANEL_LABEL_CLASS = "text-xs font-medium text-ink-muted";

interface VisitsSelectedDayPanelProps {
  dateIso: string | null;
  visits: Visit[];
  isDraftMode: boolean;
  canManageVisits: boolean;
  onAddVisit?: () => void;
  onDelete?: (visit: Visit) => void;
}

export function VisitsSelectedDayPanel({
  dateIso,
  visits,
  isDraftMode,
  canManageVisits,
  onAddVisit,
  onDelete,
}: VisitsSelectedDayPanelProps) {
  const headingId = useId();
  const hintId = useId();
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  const selectedDateLabel = dateIso
    ? formatVisitFullDate(dateIso, locale)
    : null;
  const hasVisits = visits.length > 0;
  const canShowAddVisitButton =
    canManageVisits &&
    dateIso !== null &&
    onAddVisit !== undefined;
  const canShowDeleteActions = canManageVisits && onDelete !== undefined;
  const visitsCountLabel = tCalendar("visitsCount", { count: visits.length });

  const selectedDayHint = getSelectedDayHint({
    isDraftMode,
    canManageVisits,
    t: tCalendar,
  });

  const emptyStateDescription = getEmptyStateDescription({
    isDraftMode,
    canManageVisits,
    t: tCalendar,
  });

  if (!dateIso) {
    const noDateDescription = getNoDateDescription({
      isDraftMode,
      t: tCalendar,
    });

    return (
      <Surface
        as="section"
        aria-labelledby={headingId}
        aria-describedby={isDraftMode ? hintId : undefined}
        className="p-4 lg:px-5 lg:pt-5 lg:pb-0"
      >
        <p className={`${PANEL_LABEL_CLASS} max-lg:hidden`}>
          {tCalendar("selectedDay")}
        </p>
        <div className="lg:py-6">
          <h3 id={headingId} className="text-base font-semibold text-ink-primary">
            {tCalendar("chooseDayTitle")}
          </h3>
          <p id={hintId} className="mt-1 text-sm text-ink-secondary">
            {noDateDescription}
          </p>
        </div>
      </Surface>
    );
  }

  return (
    <Surface
      as="section"
      aria-labelledby={headingId}
      aria-describedby={isDraftMode ? hintId : undefined}
    >
      <header className="flex flex-col gap-3 p-4 lg:p-5">
        <div className="space-y-1">
          <p className={`${PANEL_LABEL_CLASS} max-lg:hidden`}>{tCalendar("selectedDay")}</p>

          <div aria-live="polite" aria-atomic="true">
            <h3
              id={headingId}
              className="text-lg font-bold tracking-heading text-ink-primary lg:text-xl"
            >
              {selectedDateLabel}
            </h3>
          </div>

          <p className="font-mono text-sm text-ink-secondary">
            {visitsCountLabel}
          </p>
        </div>

        <p
          id={hintId}
          className={`flex items-start gap-2 text-sm text-ink-secondary ${isDraftMode ? "" : "max-lg:hidden"}`.trim()}
        >
          {isDraftMode ? (
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 lg:hidden" />
          ) : null}
          <span>{selectedDayHint}</span>
        </p>

        {canShowAddVisitButton ? (
          <Button
            type="button"
            onClick={onAddVisit}
            aria-label={tCalendar("addVisitOnDay", {
              date: selectedDateLabel ?? "",
            })}
            className="w-full max-lg:hidden lg:w-auto lg:self-start"
          >
            <Plus className="size-4" aria-hidden="true" />
            {tCalendar("addOnSelectedDay")}
          </Button>
        ) : null}
      </header>

      {hasVisits ? (
        <RowList
          className="border-t border-border"
          aria-labelledby={headingId}
        >
          {visits.map((visit) => (
            <VisitRow
              key={visit.id}
              visit={visit}
              canManageVisits={canManageVisits}
              onDelete={canShowDeleteActions ? onDelete : undefined}
            />
          ))}
        </RowList>
      ) : (
        <div className="border-t border-border">
          <p className="px-4 py-5 text-sm text-ink-secondary lg:hidden">
            {emptyStateDescription}
          </p>
          <EmptyState
            title={tCalendar("noVisitsTitle")}
            description={emptyStateDescription}
            titleTag="h4"
            className="hidden px-5 lg:block"
          />
        </div>
      )}
    </Surface>
  );
}
