"use client";

import { useLocale, useTranslations } from "next-intl";
import { VisitActions } from "./VisitActions";
import type { Visit } from "../../types/visits";
import { VisitDetails } from "./VisitDetails";
import { formatVisitCompactDateRangeLabel } from "../../shared/formatVisitDate";
import type { VisitStatus } from "../../types/visits";

const COMPACT_STRIP_TONE_CLASS = {
  current: "bg-emerald-50 text-emerald-800",
  upcoming: "bg-amber-50 text-amber-800",
  past: "bg-stone-100 text-stone-700",
} satisfies Record<VisitStatus, string>;

interface VisitCardProps {
  visit: Visit;
  compact?: boolean;
  canManageVisits: boolean;
  onDelete?: (visit: Visit) => void;
}

export function VisitCard({
  visit,
  compact = false,
  canManageVisits,
  onDelete,
}: VisitCardProps) {
  const locale = useLocale();
  const tVisit = useTranslations("visits");
  const canShowActions = canManageVisits && !!onDelete;
  const compactDateLabel = formatVisitCompactDateRangeLabel(
    visit.dateFrom,
    visit.dateTo,
    locale
  );

  if (compact) {
    return (
      <article
        data-visit-card
        className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-none"
      >
        <div
          className={`flex min-h-7 items-center px-3 py-1.5 text-[11px] font-medium leading-4 ${
            COMPACT_STRIP_TONE_CLASS[visit.status]
          }`}
          title={compactDateLabel}
        >
          <span className="truncate">{compactDateLabel}</span>
        </div>

        <div className="px-3 py-2.5">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <VisitDetails visit={visit} compact titleTag="h4" />
            </div>

            {canShowActions && (
              <div className="shrink-0 self-start">
                <VisitActions
                  visit={visit}
                  onDelete={onDelete}
                  size="compact"
                  deleteAriaLabel={tVisit("aria.deleteVisitFor", {
                    visitorName: visit.visitorName,
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      data-visit-card
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <VisitDetails visit={visit} titleTag="h4" />
        </div>

        {canShowActions && (
          <div className="shrink-0 self-start">
            <VisitActions
              visit={visit}
              onDelete={onDelete}
              size="default"
              deleteAriaLabel={tVisit("aria.deleteVisitFor", {
                visitorName: visit.visitorName,
              })}
            />
          </div>
        )}
      </div>
    </article>
  );
}
