"use client";

import type { KeyboardEvent, MouseEvent } from "react";

const HEADER_CONTAINER_BASE_CLASS =
  "flex items-center gap-2 border-b border-stone-200 transition-colors";

const HEADER_BUTTON_BASE_CLASS =
  "flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900";

const DAY_NUMBER_BASE_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";

interface VisitsWeekDayHeaderProps {
  dayIso: string;
  isToday: boolean;
  isSelected: boolean;
  isInDraftRange: boolean;
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
  isSelected: boolean;
  isInDraftRange: boolean;
}) {
  let backgroundClassName = "bg-white";

  if (params.isSelected) {
    backgroundClassName = "bg-stone-100/80";
  } else if (params.isInDraftRange) {
    backgroundClassName = "bg-amber-50/70";
  }

  return `${HEADER_CONTAINER_BASE_CLASS} ${backgroundClassName}`;
}

function getButtonClassName(isSelected: boolean) {
  const stateClassName = isSelected
    ? "shadow-[inset_0_0_0_1px_rgba(28,25,23,0.06)]"
    : "hover:bg-stone-50";

  return `${HEADER_BUTTON_BASE_CLASS} ${stateClassName}`.trim();
}

function getDayNumberClassName(params: {
  isToday: boolean;
  isSelected: boolean;
}) {
  const stateClassName = params.isSelected || params.isToday
    ? "bg-stone-900 text-white"
    : "bg-stone-100 text-stone-700";

  return `${DAY_NUMBER_BASE_CLASS} ${stateClassName}`;
}

function getDayLabelClassName(isSelected: boolean) {
  return isSelected
    ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-900"
    : "text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-600";
}

function getVisitsCountClassName(isSelected: boolean) {
  return isSelected
    ? "mt-1 truncate whitespace-nowrap text-xs text-stone-700"
    : "mt-1 truncate whitespace-nowrap text-xs text-stone-500";
}

export function VisitsWeekDayHeader({
  dayIso,
  isToday,
  isSelected,
  isInDraftRange,
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
    <div
      className={getContainerClassName({
        isSelected,
        isInDraftRange,
      })}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={getButtonClassName(isSelected)}
        tabIndex={tabIndex}
        data-day-iso={dayIso}
        aria-current={isToday ? "date" : undefined}
        aria-pressed={isSelected}
        aria-label={ariaLabel}
      >
        <div className="min-w-0 flex-1">
          <p className={getDayLabelClassName(isSelected)}>
            {dayLabel}
          </p>
          <p className={getVisitsCountClassName(isSelected)} title={visitsCountLabel}>
            {visitsCountShortLabel}
          </p>
        </div>

        <span className={getDayNumberClassName({ isToday, isSelected })}>
          {dayNumber}
        </span>
      </button>
    </div>
  );
}
