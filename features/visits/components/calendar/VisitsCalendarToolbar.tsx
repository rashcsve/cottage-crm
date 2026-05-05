"use client";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VisitsCalendarView } from "../../domain/visits-calendar-types";

interface SummaryItem {
  id: "upcoming" | "current" | "past";
  label: string;
  value: number;
  tone: "neutral" | "warning" | "success";
}

interface VisitsCalendarToolbarProps {
  anchorLabel: string;
  view: VisitsCalendarView;
  summaryItems: SummaryItem[];
  primaryAction?: VisitsCalendarToolbarAction;
  onViewChange: (view: VisitsCalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export interface VisitsCalendarToolbarAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  ariaLabel?: string;
}

const SUMMARY_TONE_CLASS: Record<SummaryItem["tone"], string> = {
  neutral: "border-stone-200 bg-stone-50 text-stone-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const VIEW_OPTIONS: VisitsCalendarView[] = ["month", "week", "agenda"];

const BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center rounded-xl border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const ICON_BUTTON_CLASS =
  "inline-flex h-9 w-9 items-center justify-center text-stone-700 transition hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-inset";

const VIEW_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

export function VisitsCalendarToolbar({
  anchorLabel,
  view,
  summaryItems,
  primaryAction,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: VisitsCalendarToolbarProps) {
  const t = useTranslations("visits.calendar");
  const hasSummaryItems = summaryItems.length > 0;
  const PrimaryActionIcon = primaryAction?.icon;
  const viewLabels: Record<VisitsCalendarView, string> = {
    month: t("month"),
    week: t("week"),
    agenda: t("agenda"),
  };

  return (
    <header className="flex flex-col gap-3 p-3.5 sm:p-4">
      <div className="space-y-2.5">
        <h2
          className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl"
          aria-live="polite"
        >
          {anchorLabel}
        </h2>

        {hasSummaryItems && (
          <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {summaryItems.map((item) => (
              <li
                key={item.id}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-sm ${
                  SUMMARY_TONE_CLASS[item.tone]
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="tabular-nums">{item.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div
          className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] gap-2 sm:flex sm:flex-wrap sm:items-center"
          role="group"
          aria-label={t("navigation")}
        >
          <button
            type="button"
            onClick={onPrevious}
            className={`${ICON_BUTTON_CLASS} rounded-xl border border-stone-200 bg-white focus-visible:ring-offset-2`}
            aria-label={t("previous")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <button type="button" onClick={onToday} className={BUTTON_CLASS}>
            {t("today")}
          </button>

          <button
            type="button"
            onClick={onNext}
            className={`${ICON_BUTTON_CLASS} rounded-xl border border-stone-200 bg-white focus-visible:ring-offset-2`}
            aria-label={t("next")}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center xl:justify-end">
          <div
            className="grid w-full grid-cols-3 rounded-2xl border border-stone-200 bg-stone-50 p-1 sm:w-auto sm:min-w-[18rem]"
            role="group"
            aria-label={t("viewSwitcher")}
          >
            {VIEW_OPTIONS.map((option) => {
              const isSelected = view === option;

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (!isSelected) {
                      onViewChange(option);
                    }
                  }}
                  className={`${VIEW_BUTTON_CLASS} min-w-0 px-2 sm:px-4 ${
                    isSelected
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {viewLabels[option]}
                </button>
              );
            })}
          </div>

          {primaryAction && (
            <div className="sm:flex-none">
              <button
                type="button"
                onClick={primaryAction.onClick}
                aria-label={primaryAction.ariaLabel}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 sm:w-auto"
              >
                {PrimaryActionIcon && (
                  <PrimaryActionIcon className="h-4 w-4" aria-hidden="true" />
                )}
                {primaryAction.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
