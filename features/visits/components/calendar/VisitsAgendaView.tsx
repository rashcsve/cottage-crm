"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/shared/ui/EmptyState";
import { VisitRow } from "../visit/VisitRow";
import { getAgendaSections } from "../../domain/visits-calendar";
import type { Visit } from "../../types/visits";

type VisitsAgendaViewProps = {
  visits: Visit[];
  anchorIso: string;
  canManageVisits: boolean;
  onDelete?: (visit: Visit) => void;
};

export function VisitsAgendaView({
  visits,
  anchorIso,
  canManageVisits,
  onDelete,
}: VisitsAgendaViewProps) {
  const locale = useLocale();
  const tCalendar = useTranslations("visits.calendar");

  const sections = useMemo(
    () => getAgendaSections(visits, anchorIso, locale),
    [visits, anchorIso, locale]
  );

  if (sections.length === 0) {
    return (
      <EmptyState
        title={tCalendar("noPeriodVisitsTitle")}
        description={tCalendar("noPeriodVisitsDescription")}
        className="px-5 py-8"
      />
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.key} className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-stone-900">
              {section.label}
            </h3>
            <span className="text-sm text-stone-500">
              {tCalendar("visitsCount", { count: section.visits.length })}
            </span>
          </div>

          <ul className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            {section.visits.map((visit) => (
              <VisitRow
                key={visit.id}
                visit={visit}
                canManageVisits={canManageVisits}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
