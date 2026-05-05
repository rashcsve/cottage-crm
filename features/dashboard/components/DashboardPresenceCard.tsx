import { formatVisitCompactDateRangeLabel } from "@/features/visits/shared/formatVisitDate";
import type { Visit } from "@/features/visits/types/visits";
import { parseDateOnlyUtc } from "@/lib/utils/date";
import { StatusBadge, type StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { Surface } from "@/shared/ui/Surface";

import { DashboardEmptyState } from "./DashboardEmptyState";

interface DashboardPresenceCardProps {
  badgeLabel: string;
  currentVisits: Visit[];
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  locale: string;
  nextVisit: Visit | null;
  nextVisitLabel: string;
  title: string;
  todayIso: string;
  tone: StatusBadgeTone;
}

function formatToday(todayIso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(parseDateOnlyUtc(todayIso));
}

function VisitStatusPanel({
  currentVisits,
  locale,
  nextVisit,
  nextVisitLabel,
}: {
  currentVisits: Visit[];
  locale: string;
  nextVisit: Visit | null;
  nextVisitLabel: string;
}) {
  const hasCurrentVisits = currentVisits.length > 0;

  return (
    <div className="divide-y divide-stone-200">
      {hasCurrentVisits ? (
        <div className="space-y-2.5 px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">{currentVisits.length}</StatusBadge>
            <p className="text-sm font-semibold text-stone-900">
              {currentVisits.map((visit) => visit.visitorName).join(", ")}
            </p>
          </div>

          <ul className="space-y-2">
            {currentVisits.map((visit) => (
              <li
                key={visit.id}
                className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-stone-900">
                  {visit.visitorName}
                </span>
                <span className="text-stone-500">
                  {formatVisitCompactDateRangeLabel(
                    visit.dateFrom,
                    visit.dateTo,
                    locale,
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {nextVisit ? (
        <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              {nextVisitLabel}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-stone-900">
              {nextVisit.visitorName}
            </p>
          </div>
          <p className="text-sm text-stone-600">
            {formatVisitCompactDateRangeLabel(
              nextVisit.dateFrom,
              nextVisit.dateTo,
              locale,
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardPresenceCard({
  badgeLabel,
  currentVisits,
  description,
  emptyDescription,
  emptyTitle,
  locale,
  nextVisit,
  nextVisitLabel,
  title,
  todayIso,
  tone,
}: DashboardPresenceCardProps) {
  return (
    <Surface className="overflow-hidden">
      <div className="px-4 py-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              {formatToday(todayIso, locale)}
            </p>
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
            <p className="max-w-2xl text-sm leading-5 text-stone-600">
              {description}
            </p>
          </div>

          <StatusBadge tone={tone} className="shrink-0">
            {badgeLabel}
          </StatusBadge>
        </div>
      </div>

      {currentVisits.length > 0 || nextVisit ? (
        <VisitStatusPanel
          currentVisits={currentVisits}
          nextVisit={nextVisit}
          nextVisitLabel={nextVisitLabel}
          locale={locale}
        />
      ) : (
        <div className="border-t border-stone-200 px-4 py-3.5">
          <DashboardEmptyState
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      )}
    </Surface>
  );
}
