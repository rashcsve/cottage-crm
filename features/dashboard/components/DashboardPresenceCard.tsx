import type { ReactNode } from "react";

import { VisitCoupleLabel } from "@/features/visits/components/visit/VisitCoupleLabel";
import { getCoupleColorClasses } from "@/features/visits/domain/couples";
import { formatVisitCompactDateRangeLabel } from "@/features/visits/shared/formatVisitDate";
import type { Visit } from "@/features/visits/types/visits";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList } from "@/shared/ui/RowList";
import { Surface } from "@/shared/ui/Surface";

const ROW_CLASS = "flex min-h-12 items-center gap-3 border-l-4 px-4 py-3";

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
  statementNames?: string;
  stayRemaining?: string;
}

function VisitDates({ visit, locale }: { visit: Visit; locale: string }) {
  return (
    <span className="shrink-0 font-mono text-xs text-ink-secondary">
      {formatVisitCompactDateRangeLabel(visit.dateFrom, visit.dateTo, locale)}
    </span>
  );
}

function VisitTitle({ visit }: { visit: Visit }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-semibold text-ink-primary">{visit.visitorName}</span>
      {visit.coupleLabel === visit.visitorName ? null : (
        <VisitCoupleLabel visit={visit} />
      )}
    </span>
  );
}

function rowClassName(visit: Visit) {
  return `${ROW_CLASS} ${getCoupleColorClasses(visit.couple).edge}`;
}

function SingleStayDetail({
  visit,
  locale,
  remaining,
}: {
  visit: Visit;
  locale: string;
  remaining: string;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-secondary">
      <VisitDates visit={visit} locale={locale} />
      <span aria-hidden="true">·</span>
      <span>{remaining}</span>
      {visit.coupleLabel === visit.visitorName ? null : (
        <>
          <span aria-hidden="true">·</span>
          <VisitCoupleLabel visit={visit} />
        </>
      )}
    </p>
  );
}

function CurrentVisitRow({ visit, locale }: { visit: Visit; locale: string }) {
  return (
    <li className={`${rowClassName(visit)} justify-between`}>
      <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-ink-primary">
          {visit.coupleLabel ?? visit.visitorName}
        </span>
        {visit.coupleLabel ? null : <VisitCoupleLabel visit={visit} />}
      </span>
      <VisitDates visit={visit} locale={locale} />
    </li>
  );
}

function NextVisitRow({
  visit,
  label,
  locale,
}: {
  visit: Visit;
  label: string;
  locale: string;
}) {
  return (
    <div className={`${rowClassName(visit)} flex-wrap justify-between`}>
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold text-ink-muted">{label}</p>
        <VisitTitle visit={visit} />
      </div>
      <VisitDates visit={visit} locale={locale} />
    </div>
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
  statementNames,
  stayRemaining,
}: DashboardPresenceCardProps) {
  const singleStay =
    currentVisits.length === 1 && stayRemaining ? currentVisits[0] : null;
  const sections: ReactNode[] = [];

  if (currentVisits.length > 0 && !singleStay) {
    sections.push(
      <div key="current">
        <RowList>
          {currentVisits.map((visit) => (
            <CurrentVisitRow key={visit.id} visit={visit} locale={locale} />
          ))}
        </RowList>
        {moreLabel ? (
          <p className="border-t border-border px-4 py-3 text-sm text-ink-secondary">
            {moreLabel}
          </p>
        ) : null}
      </div>,
    );
  }

  if (nextVisit) {
    sections.push(
      <NextVisitRow
        key="next"
        visit={nextVisit}
        label={nextVisitLabel}
        locale={locale}
      />,
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-ink-muted">{label}</h2>
        <p className="text-2xl font-bold tracking-[-0.02em] text-ink-primary lg:text-3xl">
          {statement}
          {statementNames ? (
            <>
              {" "}
              <span className="lg:block">{statementNames}.</span>
            </>
          ) : null}
        </p>
        {singleStay && stayRemaining ? (
          <SingleStayDetail
            visit={singleStay}
            locale={locale}
            remaining={stayRemaining}
          />
        ) : null}
      </div>

      {sections.length > 0 ? (
        <Surface className="divide-y divide-border overflow-hidden">
          {sections}
        </Surface>
      ) : null}

      {sections.length === 0 && !singleStay ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="border-y border-border"
        />
      ) : null}
    </div>
  );
}
