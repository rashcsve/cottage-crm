"use client";

import type { KeyboardEvent, MouseEvent } from "react";

const HEADER_CONTAINER_BASE_CLASS =
  "flex items-center border-b border-border transition-colors";

const DRAFT_RANGE_BAND_CLASS = "bg-muted range-band";

const HEADER_BUTTON_BASE_CLASS =
  "flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 px-3 py-3 text-left transition-colors focus-inset";

const DAY_NUMBER_BASE_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-control font-mono text-sm font-semibold tracking-data";

interface VisitsWeekDayHeaderProps {
  dayIso: string;
  isToday: boolean;
  isSelected: boolean;
  isTinted: boolean;
  isDraftBoundary: boolean;
  dayLabel: string;
  dayNumber: string;
  visitsCountLabel: string;
  visitsCountShortLabel: string;
  ariaLabel: string;
  tabIndex: number;
  onSelectDay: (extendRange: boolean) => void;
  onDayKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement>,
    dayIso: string
  ) => void;
}

function getContainerClassName(params: {
  isTinted: boolean;
  isDraftBoundary: boolean;
}) {
  if (params.isTinted && !params.isDraftBoundary) {
    return `${HEADER_CONTAINER_BASE_CLASS} ${DRAFT_RANGE_BAND_CLASS}`;
  }

  return HEADER_CONTAINER_BASE_CLASS;
}

function getButtonClassName(params: {
  isSelected: boolean;
  isTinted: boolean;
  isDraftBoundary: boolean;
}) {
  const isEmphasised =
    params.isSelected || params.isTinted || params.isDraftBoundary;

  return isEmphasised
    ? HEADER_BUTTON_BASE_CLASS
    : `${HEADER_BUTTON_BASE_CLASS} hover:bg-page`;
}

function getDayNumberClassName(isToday: boolean) {
  return isToday
    ? `${DAY_NUMBER_BASE_CLASS} bg-accent text-on-accent`
    : `${DAY_NUMBER_BASE_CLASS} text-ink-primary`;
}

function getDayLabelClassName(isSelected: boolean) {
  return isSelected
    ? "text-xs font-semibold capitalize text-ink-primary"
    : "text-xs font-medium capitalize text-ink-muted";
}

export function VisitsWeekDayHeader({
  dayIso,
  isToday,
  isSelected,
  isTinted,
  isDraftBoundary,
  dayLabel,
  dayNumber,
  visitsCountLabel,
  visitsCountShortLabel,
  ariaLabel,
  tabIndex,
  onSelectDay,
  onDayKeyDown,
}: VisitsWeekDayHeaderProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onSelectDay(event.shiftKey);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onDayKeyDown?.(event, dayIso);
  }

  return (
    <div className={getContainerClassName({ isTinted, isDraftBoundary })}>
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={getButtonClassName({ isSelected, isTinted, isDraftBoundary })}
        tabIndex={tabIndex}
        data-day-iso={dayIso}
        aria-current={isToday ? "date" : undefined}
        aria-pressed={isSelected}
        aria-label={ariaLabel}
      >
        <div className="min-w-0 flex-1">
          <p className={getDayLabelClassName(isSelected)}>{dayLabel}</p>
          <p
            className="mt-1 truncate whitespace-nowrap font-mono text-xs text-ink-secondary"
            title={visitsCountLabel}
          >
            {visitsCountShortLabel}
          </p>
        </div>

        <span className={getDayNumberClassName(isToday)}>{dayNumber}</span>
      </button>
    </div>
  );
}
