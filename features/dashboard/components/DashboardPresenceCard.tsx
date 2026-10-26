import { formatVisitCompactDateRangeLabel } from "@/features/visits/shared/formatVisitDate";
import type { Visit } from "@/features/visits/types/visits";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList, RowListItem } from "@/shared/ui/RowList";

interface DashboardPresenceCardProps {
  currentVisits: Visit[];
  emptyDescription: string;
  emptyTitle: string;
  label: string;
  locale: string;
  moreLabel?: string;
  nextVisit: Visit | null;
  nextVisitLabel: string;
  statement: string;
  stayRemaining?: string;
}

function VisitDates({ visit, locale }: { visit: Visit; locale: string }) {
  return (
    <span className="shrink-0 font-mono text-xs text-ink-secondary">
      {formatVisitCompactDateRangeLabel(visit.dateFrom, visit.dateTo, locale)}
    </span>
  );
}

export function DashboardPresenceCard({
  currentVisits,
  emptyDescription,
  emptyTitle,
  label,
  locale,
  moreLabel,
  nextVisit,
  nextVisitLabel,
  statement,
  stayRemaining,
}: DashboardPresenceCardProps) {
  const singleStay =
    currentVisits.length === 1 && stayRemaining ? currentVisits[0] : null;
  const showVisitRows = currentVisits.length > 0 && !singleStay;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-ink-muted">{label}</h2>
        <p className="text-2xl font-bold tracking-[-0.02em] text-ink-primary lg:text-3xl">
          {statement}
        </p>
        {singleStay ? (
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink-secondary">
            <VisitDates visit={singleStay} locale={locale} />
            <span aria-hidden="true">·</span>
            <span>{stayRemaining}</span>
          </p>
        ) : null}
      </div>

      {showVisitRows ? (
        <div className="divide-y divide-border border-y border-border">
          <RowList>
            {currentVisits.map((visit) => (
              <RowListItem key={visit.id} className="justify-between">
                <span className="font-semibold text-ink-primary">
                  {visit.visitorName}
                </span>
                <VisitDates visit={visit} locale={locale} />
              </RowListItem>
            ))}
          </RowList>
          {moreLabel ? (
            <p className="py-3 text-sm text-ink-secondary">{moreLabel}</p>
          ) : null}
        </div>
      ) : null}

      {nextVisit ? (
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-y border-border py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-muted">
              {nextVisitLabel}
            </p>
            <p className="font-semibold text-ink-primary">
              {nextVisit.visitorName}
            </p>
          </div>
          <VisitDates visit={nextVisit} locale={locale} />
        </div>
      ) : null}

      {currentVisits.length === 0 && !nextVisit ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="border-y border-border"
        />
      ) : null}
    </div>
  );
}
