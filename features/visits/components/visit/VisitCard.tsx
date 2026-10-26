"use client";

import { useLocale, useTranslations } from "next-intl";
import { VisitActions } from "./VisitActions";
import type { Visit } from "../../types/visits";
import { VisitDetails } from "./VisitDetails";
import { formatVisitCompactDateRangeLabel } from "../../shared/formatVisitDate";

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
        className="overflow-hidden rounded-control border border-border bg-surface"
      >
        <div
          className="flex min-h-7 items-center bg-muted px-3 py-1.5 font-mono text-xs text-ink-secondary"
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
    <article data-visit-card className="rounded-card bg-surface p-4">
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
