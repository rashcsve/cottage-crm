"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { VisitActions } from "./VisitActions";
import { VisitMeta } from "./VisitMeta";
import { getVisitStatus } from "../domain/visit-status";
import { parseVisitDateRange } from "../domain/format-visit";
import type { Visit } from "../types/visits";
import { formatDateOnly } from "@/lib/utils/date";

interface VisitRowProps {
  visit: Visit;
  canManageVisits: boolean;
  today: string;
  onDelete?: (visit: Visit) => void;
}

function getVisitStatusTone(
  status: ReturnType<typeof getVisitStatus>
): StatusBadgeTone {
  switch (status) {
    case "current":
      return "success";
    case "upcoming":
      return "warning";
    case "past":
      return "neutral";
  }
}

export function VisitRow({
  visit,
  canManageVisits,
  today,
  onDelete,
}: VisitRowProps) {
  const tVisit = useTranslations("visits");
  const tMeta = useTranslations("visits.meta");
  const tStatus = useTranslations("visits.status");
  const locale = useLocale();

  const status = getVisitStatus(visit.dateFrom, visit.dateTo, today);
  const dateRange = parseVisitDateRange(visit.dateFrom, visit.dateTo);

  const fromStr = formatDateOnly(visit.dateFrom, locale, "d.M.yyyy");
  const toStr = formatDateOnly(visit.dateTo, locale, "d.M.yyyy");
  const dateRangeStr = dateRange.isSameDay ? fromStr : `${fromStr} – ${toStr}`;

  return (
    <li className="group border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-stone-900">
                {visit.visitorName}
              </h3>

              <p className="mt-1 text-sm text-stone-600">{dateRangeStr}</p>

              {visit.note && (
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {visit.note}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge tone={getVisitStatusTone(status)}>
                  {tStatus(status)}
                </StatusBadge>
                <VisitMeta visit={visit} addedByLabel={tMeta("addedBy")} />
              </div>
            </div>

            {canManageVisits && onDelete && (
              <div className="flex items-start self-start">
                <VisitActions
                  visit={visit}
                  onDelete={onDelete}
                  deleteAriaLabel={`${tVisit("aria.deleteVisit")} ${
                    visit.visitorName
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
