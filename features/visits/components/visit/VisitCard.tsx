"use client";

import { useLocale, useTranslations } from "next-intl";
import { VisitActions } from "./VisitActions";
import type { Visit } from "../../types/visits";
import { getCoupleColorClasses } from "../../domain/couples";
import { VisitDetails } from "./VisitDetails";
import { formatVisitWeekCardDateRangeLabel } from "../../shared/formatVisitDate";

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
  const coupleColors = getCoupleColorClasses(visit.couple);

  if (compact) {
    const weekCardDateLabel = formatVisitWeekCardDateRangeLabel(
      visit.dateFrom,
      visit.dateTo,
      locale
    );

    return (
      <article
        data-visit-card
        className="group/visit-card overflow-hidden rounded-control border border-border bg-surface"
      >
        <div
          className={`relative flex min-h-7 items-center ${coupleColors.band} px-2.5 py-1.5 font-mono text-xs text-ink-secondary ${canShowActions ? "[@media(hover:none)]:pr-10" : ""}`}
        >
          <span className="min-w-0 truncate">{weekCardDateLabel}</span>

          {canShowActions && (
            <div
              className={`absolute inset-y-0 right-0 flex ${coupleColors.band} ${ACTION_VISIBILITY_CLASS}`}
            >
              <VisitActions
                visit={visit}
                onDelete={onDelete}
                size="strip"
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
    <article
      data-visit-card
      className={`group/visit-card rounded-card border-l-4 ${coupleColors.edge} bg-surface p-4`}
    >
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
