"use client";

import type { MouseEvent } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VisitsCalendarDaySelection } from "../../../application/calendar/day-selection";
import type { CalendarSegment } from "../../../domain/visits-calendar-types";
import type { Visit } from "../../../types/visits";
import {
  getCoupleColorClasses,
  getVisitCoupleLabel,
} from "../../../domain/couples";
import { Button } from "@/shared/ui/Button";
import { VisitCard } from "../../visit/VisitCard";

const EMPTY_STATE_MIN_HEIGHT_CLASS = "min-h-34";
const ACTION_ROW_HEIGHT_CLASS = "h-11";

const TIMELINE_ROW_BASE_CLASS =
  "-mx-4 flex h-6 items-center px-3 text-xs font-medium text-ink-primary";

interface VisitsWeekTimelineRow {
  segment: CalendarSegment;
  isStart: boolean;
  isEnd: boolean;
}

interface VisitsWeekDayContentProps {
  dayIso: string;
  dateLabel: string;
  visits: Visit[];
  isSelected: boolean;
  isDraftMode: boolean;
  canManageVisits: boolean;
  onAddVisit: (iso?: string) => void;
  onSelectDay: (selection: VisitsCalendarDaySelection) => void;
  timelineRows: Array<VisitsWeekTimelineRow | null>;
  onDelete?: (visit: Visit) => void;
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

function isInteractiveContentTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(
      "button, a, input, textarea, select, summary, [data-visit-card]",
    ) !== null
  );
}

function getContentAreaClassName(canRetargetDraft: boolean): string {
  if (canRetargetDraft) {
    return "mt-2 flex-1 cursor-pointer";
  }

  return "mt-2 flex-1";
}

function getTimelineShapeClassName(row: VisitsWeekTimelineRow): string {
  if (row.isStart && row.isEnd) {
    return "rounded-control";
  }

  if (row.isStart) {
    return "rounded-l-control";
  }

  if (row.isEnd) {
    return "rounded-r-control";
  }

  return "";
}

function getTimelineOverlapClassName(row: VisitsWeekTimelineRow): string {
  if (row.isStart && !row.isEnd) {
    return "-mr-px";
  }

  if (!row.isStart && row.isEnd) {
    return "-ml-px";
  }

  if (!row.isStart && !row.isEnd) {
    return "-mx-px";
  }

  return "";
}

function getTimelineRowClassName(row: VisitsWeekTimelineRow): string {
  const shapeClassName = getTimelineShapeClassName(row);
  const overlapClassName = getTimelineOverlapClassName(row);
  const fillClassName = getCoupleColorClasses(row.segment.visit.couple).fill;
  return `${TIMELINE_ROW_BASE_CLASS} ${shapeClassName} ${overlapClassName} ${fillClassName}`.trim();
}

export function VisitsWeekDayContent({
  dayIso,
  dateLabel,
  visits,
  isSelected,
  isDraftMode,
  canManageVisits,
  onAddVisit,
  onSelectDay,
  timelineRows,
  onDelete,
}: VisitsWeekDayContentProps) {
  const tCalendar = useTranslations("visits.calendar");
  const tMeta = useTranslations("visits.meta");

  const canShowDeleteActions = canManageVisits && onDelete !== undefined;
  const canShowPrimaryAction = isSelected && canManageVisits;
  const canShowHoverAction = !isSelected && canManageVisits && !isDraftMode;
  const canRetargetDraft = isDraftMode && !isSelected;
  const hasVisits = visits.length > 0;

  function handleAddVisit() {
    if (!isSelected) {
      onSelectDay({
        iso: dayIso,
        extendRange: false,
      });
    }

    onAddVisit(dayIso);
  }

  function handleContentClick(event: MouseEvent<HTMLDivElement>) {
    if (!canRetargetDraft || isInteractiveContentTarget(event.target)) {
      return;
    }

    onSelectDay({
      iso: dayIso,
      extendRange: event.shiftKey,
    });
  }

  function renderEmptyState(minHeightClassName: string) {
    return (
      <div
        className={`flex items-center justify-center px-4 py-4 text-center ${minHeightClassName}`}
      >
        <p className="text-sm text-ink-muted">
          {tCalendar("noVisitsShort")}
        </p>
      </div>
    );
  }

  function renderVisitsContent() {
    if (!hasVisits) {
      return renderEmptyState(EMPTY_STATE_MIN_HEIGHT_CLASS);
    }

    return (
      <div className={`${EMPTY_STATE_MIN_HEIGHT_CLASS} space-y-2`}>
        {visits.map((visit) => (
          <VisitCard
            key={`${dayIso}-${visit.id}`}
            visit={visit}
            compact
            canManageVisits={canManageVisits}
            onDelete={canShowDeleteActions ? onDelete : undefined}
          />
        ))}
      </div>
    );
  }

  function renderTimeline() {
    if (timelineRows.length === 0) {
      return null;
    }

    return (
      <div className="hidden space-y-1 pb-2 lg:block">
        {timelineRows.map((row, rowIndex) => {
          if (!row) {
            return <div key={`timeline-spacer-${rowIndex}`} className="h-6" />;
          }

          return (
            <div
              key={`${row.segment.key}-${dayIso}-${rowIndex}`}
              className={getTimelineRowClassName(row)}
              title={getTimelineTitle(row.segment, tMeta("noCouple"))}
              aria-hidden="true"
            >
              {row.isStart ? (
                <span className="truncate">
                  {row.segment.visit.visitorName}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  function renderPrimaryAction() {
    if (!canShowPrimaryAction) {
      if (!canShowHoverAction) {
        return null;
      }

      return (
        <button
          type="button"
          onClick={handleAddVisit}
          aria-label={tCalendar("addVisitOnDay", {
            date: dateLabel,
          })}
          tabIndex={-1}
          className="inline-flex size-full items-center justify-center rounded-control border-control border-border bg-surface px-3 text-sm font-medium text-ink-secondary opacity-0 transition hover:bg-page hover:text-ink-primary lg:pointer-events-none lg:group-hover/day:pointer-events-auto lg:group-hover/day:opacity-100"
        >
          {tCalendar("addVisit")}
        </button>
      );
    }

    return (
      <Button
        type="button"
        variant="secondary"
        onClick={handleAddVisit}
        aria-label={tCalendar("addVisitOnDay", {
          date: dateLabel,
        })}
        className="w-full px-3"
      >
        <Plus aria-hidden="true" className="size-4 shrink-0" />
        {tCalendar("addVisit")}
      </Button>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2.5">
      {renderTimeline()}

      <div className="border-t border-border pt-2.5">
        <div className={ACTION_ROW_HEIGHT_CLASS}>{renderPrimaryAction()}</div>

        <div
          className={getContentAreaClassName(canRetargetDraft)}
          onClick={handleContentClick}
        >
          {renderVisitsContent()}
        </div>
      </div>
    </div>
  );
}
