"use client";

import { useTranslations } from "next-intl";
import type { CalendarSegment } from "../../../domain/visits-calendar-types";
import {
  getCoupleColorClasses,
  getVisitCoupleLabel,
} from "../../../domain/couples";
import {
  getWeekColumnSpanClass,
  getWeekColumnStartClass,
} from "./visits-week-view";

const BAR_BASE_CLASS =
  "pointer-events-auto flex h-6 min-w-0 items-center px-3 text-xs font-medium text-ink-primary";

interface VisitsWeekTimelineProps {
  rows: CalendarSegment[][];
}

function getTimelineTitle(
  segment: CalendarSegment,
  noCoupleLabel: string
): string {
  const prefix = segment.continuesBefore ? "... " : "";
  const suffix = segment.continuesAfter ? " ..." : "";

  const coupleLabel = getVisitCoupleLabel(segment.visit, noCoupleLabel);
  const coupleSuffix = coupleLabel ? ` · ${coupleLabel}` : "";

  return `${prefix}${segment.visit.visitorName}${suffix}${coupleSuffix}`;
}

function getBarClassName(segment: CalendarSegment): string {
  const columnStartClassName = getWeekColumnStartClass(segment.startIndex);
  const columnSpanClassName = getWeekColumnSpanClass(segment.span);
  const startClassName = segment.continuesBefore
    ? ""
    : "ml-1.5 rounded-l-control";
  const endClassName = segment.continuesAfter ? "" : "mr-1.5 rounded-r-control";
  const fillClassName = getCoupleColorClasses(segment.visit.couple).fill;

  return [
    BAR_BASE_CLASS,
    columnStartClassName,
    columnSpanClassName,
    startClassName,
    endClassName,
    fillClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

export function VisitsWeekTimeline({ rows }: VisitsWeekTimelineProps) {
  const tMeta = useTranslations("visits.meta");

  if (rows.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-10 col-span-7 col-start-1 row-start-2 space-y-1 pt-2.5"
    >
      {rows.map((row, rowIndex) => (
        <div key={`timeline-row-${rowIndex}`} className="grid h-6 grid-cols-7">
          {row.map((segment) => (
            <div
              key={segment.key}
              className={getBarClassName(segment)}
              title={getTimelineTitle(segment, tMeta("noCouple"))}
            >
              <span className="truncate">{segment.visit.visitorName}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
