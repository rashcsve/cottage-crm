"use client";

import { useId, useMemo } from "react";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList } from "@/shared/ui/RowList";
import { Surface } from "@/shared/ui/Surface";
import { VisitRow } from "../visit/VisitRow";
import { getAgendaSections } from "../../domain/visits-calendar";
import type { Visit } from "../../types/visits";

interface VisitsAgendaAddVisitAction {
  label: string;
  onClick: () => void;
}

type VisitsAgendaViewProps = {
  visits: Visit[];
  anchorIso: string;
  canManageVisits: boolean;
  addVisitAction?: VisitsAgendaAddVisitAction;
  onDelete?: (visit: Visit) => void;
};

export function VisitsAgendaView({
  visits,
  anchorIso,
  canManageVisits,
  addVisitAction,
  onDelete,
}: VisitsAgendaViewProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");
  const headingPrefix = useId();

  const sections = useMemo(
    () => getAgendaSections(visits, anchorIso, locale),
    [visits, anchorIso, locale]
  );

  return (
    <div className="flex flex-col gap-3 lg:gap-6">
      {addVisitAction && (
        <div className="hidden lg:block">
          <Button
            type="button"
            onClick={addVisitAction.onClick}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4" aria-hidden="true" />
            {addVisitAction.label}
          </Button>
        </div>
      )}

      {sections.length === 0 && (
        <Surface className="p-4 lg:px-5 lg:py-0">
          <EmptyState
            title={tCalendar("noPeriodVisitsTitle")}
            description={tCalendar("noPeriodVisitsDescription")}
            className="max-lg:py-0"
          />
        </Surface>
      )}

      {sections.map((section) => (
        <section
          key={section.key}
          aria-labelledby={`${headingPrefix}-${section.key}`}
          className="rounded-card bg-surface lg:space-y-2 lg:rounded-none lg:bg-transparent"
        >
          <div className="space-y-1 p-4 lg:flex lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-4 lg:gap-y-1 lg:space-y-0 lg:p-0">
            <h3
              id={`${headingPrefix}-${section.key}`}
              className="text-lg font-bold tracking-heading text-ink-primary lg:font-mono lg:text-base lg:font-semibold lg:tracking-data"
            >
              {section.label}
            </h3>
            <span className="block font-mono text-sm text-ink-secondary lg:text-ink-muted">
              {tCalendar("visitsCount", { count: section.visits.length })}
            </span>
          </div>

          <Surface>
            <RowList
              aria-labelledby={`${headingPrefix}-${section.key}`}
              className="border-t border-border lg:border-t-0"
            >
              {section.visits.map((visit) => (
                <VisitRow
                  key={visit.id}
                  visit={visit}
                  canManageVisits={canManageVisits}
                  onDelete={onDelete}
                />
              ))}
            </RowList>
          </Surface>
        </section>
      ))}

      {addVisitAction && (
        <div className="sticky bottom-(--mobile-nav-height,0px) z-10 border-t border-border bg-surface p-3 lg:hidden">
          <Button
            type="button"
            onClick={addVisitAction.onClick}
            className="w-full min-h-12"
          >
            <Plus className="size-4" aria-hidden="true" />
            {tCalendar("planStay")}
          </Button>
        </div>
      )}
    </div>
  );
}
