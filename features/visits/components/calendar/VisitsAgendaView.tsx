"use client";

import { useMemo } from "react";
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

  const sections = useMemo(
    () => getAgendaSections(visits, anchorIso, locale),
    [visits, anchorIso, locale]
  );

  return (
    <div className="space-y-6">
      {addVisitAction && (
        <Button
          type="button"
          onClick={addVisitAction.onClick}
          className="w-full sm:w-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          {addVisitAction.label}
        </Button>
      )}

      {sections.length === 0 && (
        <Surface className="px-4 sm:px-5">
          <EmptyState
            title={tCalendar("noPeriodVisitsTitle")}
            description={tCalendar("noPeriodVisitsDescription")}
          />
        </Surface>
      )}

      {sections.map((section) => (
        <section key={section.key} className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-mono text-base font-semibold tracking-data text-ink-primary">
              {section.label}
            </h3>
            <span className="font-mono text-sm text-ink-muted">
              {tCalendar("visitsCount", { count: section.visits.length })}
            </span>
          </div>

          <Surface>
            <RowList>
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
    </div>
  );
}
