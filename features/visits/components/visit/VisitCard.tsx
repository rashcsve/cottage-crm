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

const ACTION_VISIBILITY_CLASS =
  "transition-opacity lg:[@media(hover:hover)_and_(pointer:fine)]:opacity-0 lg:[@media(hover:hover)_and_(pointer:fine)]:group-hover/visit-card:opacity-100 lg:[@media(hover:hover)_and_(pointer:fine)]:group-focus-within/visit-card:opacity-100";

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
        className="group/visit-card overflow-hidden rounded-control border border-border bg-surface"
      >
        <div className="flex min-h-7 items-center justify-between gap-1 bg-muted py-1.5 pl-2.5 font-mono text-xs text-ink-secondary">
          <span className="min-w-0 whitespace-nowrap">{compactDateLabel}</span>

          {canShowActions && (
            <div className={`-my-1.5 shrink-0 ${ACTION_VISIBILITY_CLASS}`}>
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

        <div className="px-2.5 py-2">
          <VisitDetails visit={visit} compact titleTag="h4" />
        </div>
      </article>
    );
  }

  return (
    <article data-visit-card className="group/visit-card rounded-card bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <VisitDetails visit={visit} titleTag="h4" />
        </div>

        {canShowActions && (
          <div className={`shrink-0 self-start ${ACTION_VISIBILITY_CLASS}`}>
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
