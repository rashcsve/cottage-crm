"use client";

import { Info, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CalendarDay } from "../../../domain/visits-calendar-types";
import { formatVisitFullDate } from "../../../shared/formatVisitDate";
import type { Visit } from "../../../types/visits";
import { Button } from "@/shared/ui/Button";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";
import { RowList } from "@/shared/ui/RowList";
import { VisitRow } from "../../visit/VisitRow";
import {
  getEmptyStateDescription,
  getNoDateDescription,
} from "../shared/day-panel-text";

const PANEL_SECTION_CLASS = "border-t border-border bg-surface";

interface VisitsWeekMobilePanelProps {
  day: CalendarDay | null;
  isDraftMode: boolean;
  canManageVisits: boolean;
  onAddVisit: (iso?: string) => void;
  onDelete?: (visit: Visit) => void;
}

export function VisitsWeekMobilePanel({
  day,
  isDraftMode,
  canManageVisits,
  onAddVisit,
  onDelete,
}: VisitsWeekMobilePanelProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  if (!day) {
    const noDayDescription = getNoDateDescription({
      isDraftMode,
      t: tCalendar,
    });

    return (
      <section className={`${PANEL_SECTION_CLASS} p-4`}>
        <h3 className="text-base font-semibold text-ink-primary">
          {tCalendar("chooseDayTitle")}
        </h3>
        <p className="mt-1 text-sm text-ink-secondary">{noDayDescription}</p>
      </section>
    );
  }

  const selectedDateLabel = formatVisitFullDate(day.date, locale);
  const visitsCountLabel = tCalendar("visitsCount", {
    count: day.visits.length,
  });
  const canShowDeleteActions = canManageVisits && onDelete !== undefined;
  const emptyStateDescription = getEmptyStateDescription({
    isDraftMode,
    canManageVisits,
    t: tCalendar,
  });

  return (
    <section className={PANEL_SECTION_CLASS}>
      <header className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-heading text-ink-primary">
            {selectedDateLabel}
          </h3>
          <p className="font-mono text-sm text-ink-secondary">
            {visitsCountLabel}
          </p>
        </div>

        {isDraftMode ? (
          <p className="flex items-start gap-2 text-sm text-ink-secondary">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{tCalendar("selectedDayHintEditing")}</span>
          </p>
        ) : null}
      </header>

      {day.visits.length > 0 ? (
        <RowList className="border-t border-border">
          {day.visits.map((visit) => (
            <VisitRow
              key={visit.id}
              visit={visit}
              canManageVisits={canManageVisits}
              onDelete={canShowDeleteActions ? onDelete : undefined}
            />
          ))}
        </RowList>
      ) : (
        <p className="border-t border-border px-4 py-5 text-sm text-ink-secondary">
          {emptyStateDescription}
        </p>
      )}

      {canManageVisits ? (
        <MobileActionBar>
          <Button
            type="button"
            onClick={() => onAddVisit(day.iso)}
            aria-label={tCalendar("planStayOnDay", {
              date: selectedDateLabel,
            })}
            className="w-full min-h-12"
          >
            <Plus className="size-4" aria-hidden="true" />
            {tCalendar("planStay")}
          </Button>
        </MobileActionBar>
      ) : null}
    </section>
  );
}
