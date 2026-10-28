"use client";

import { useId } from "react";
import { Plus } from "lucide-react";
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
        className="px-4 pt-4 sm:px-5 sm:pt-5"
      >
        <p id={headingId} className={PANEL_LABEL_CLASS}>
          {tCalendar("selectedDay")}
        </p>
        <EmptyState
          title={tCalendar("chooseDayTitle")}
          description={noDateDescription}
          titleTag="h3"
        />
      </Surface>
    );
  }

  return (
    <Surface as="section" aria-labelledby={headingId}>
      <header className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="space-y-1">
          <p className={PANEL_LABEL_CLASS}>{tCalendar("selectedDay")}</p>

          <div aria-live="polite" aria-atomic="true">
            <h3
              id={headingId}
              className="text-xl font-bold tracking-heading text-ink-primary"
            >
              {selectedDateLabel}
            </h3>
          </div>

          <p className="font-mono text-sm text-ink-secondary">
            {visitsCountLabel}
          </p>
        </div>

        <p className="text-sm text-ink-secondary">{selectedDayHint}</p>

        {canShowAddVisitButton ? (
          <Button
            type="button"
            onClick={onAddVisit}
            aria-label={tCalendar("addVisitOnDay", {
              date: selectedDateLabel ?? "",
            })}
            className="w-full sm:w-auto sm:self-start"
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
        <EmptyState
          title={tCalendar("noVisitsTitle")}
          description={emptyStateDescription}
          titleTag="h4"
          className="border-t border-border px-4 sm:px-5"
        />
      )}
    </Surface>
  );
}
