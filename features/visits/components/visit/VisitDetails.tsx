"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { formatVisitDateRangeLabel } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";
import { VisitMeta } from "./VisitMeta";
import { getVisitStatusBadgeTone } from "./visit-status-badge-tone";

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

  const statusTone = getVisitStatusBadgeTone(visit.status);
  const statusLabel = tStatus(visit.status);

  if (compact) {
    return (
      <div className="min-w-0 space-y-1.5">
        <TitleTag className="truncate text-[13px] font-semibold leading-5 text-stone-900">
          {visit.visitorName}
        </TitleTag>

        {visit.note ? (
          <p
            className="overflow-hidden text-[11px] leading-4 text-stone-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
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
      <div className="flex flex-wrap items-center gap-2">
        <TitleTag className="text-sm font-semibold text-stone-900">
          {visit.visitorName}
        </TitleTag>
        <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      </div>

      <p className="mt-1 text-sm text-stone-600">{dateLabel}</p>

      {visit.note ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-600">
          {visit.note}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <VisitMeta visit={visit} addedByLabel={tMeta("addedBy")} />
      </div>
    </div>
  );
}
