"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusLabel } from "@/shared/ui/StatusLabel";
import { formatVisitDateRangeLabel } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";
import { VisitMeta } from "./VisitMeta";
import { getVisitStatusTone } from "./visit-status-badge-tone";

interface VisitDetailsProps {
  visit: Visit;
  compact?: boolean;
  titleTag?: "h3" | "h4";
}

export function VisitDetails({
  visit,
  compact = false,
  titleTag = "h3",
}: VisitDetailsProps) {
  const locale = useLocale();
  const tMeta = useTranslations("visits.meta");
  const tStatus = useTranslations("visits.status");
  const TitleTag = titleTag;

  const dateLabel = formatVisitDateRangeLabel(
    visit.dateFrom,
    visit.dateTo,
    locale
  );

  const { tone, icon } = getVisitStatusTone(visit.status);
  const statusLabel = (
    <StatusLabel tone={tone} icon={icon} className="text-xs">
      {tStatus(visit.status)}
    </StatusLabel>
  );

  if (compact) {
    return (
      <div className="min-w-0 space-y-1.5">
        <TitleTag className="wrap-break-word text-sm font-semibold text-ink-primary">
          {visit.visitorName}
        </TitleTag>

        {statusLabel}

        {visit.note ? (
          <p
            className="line-clamp-2 text-xs text-ink-secondary"
            title={visit.note}
          >
            {visit.note}
          </p>
        ) : null}

        <div className="min-w-0">
          <VisitMeta visit={visit} addedByLabel={tMeta("addedBy")} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <TitleTag className="wrap-break-word text-base font-semibold text-ink-primary">
          {visit.visitorName}
        </TitleTag>
        {statusLabel}
      </div>

      <p className="mt-1 font-mono text-sm text-ink-secondary">{dateLabel}</p>

      {visit.note ? (
        <p className="mt-2 whitespace-pre-line text-sm text-ink-secondary">
          {visit.note}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <VisitMeta visit={visit} addedByLabel={tMeta("addedBy")} />
      </div>
    </div>
  );
}
