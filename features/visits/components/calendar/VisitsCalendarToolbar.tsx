"use client";

import { ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VisitsCalendarView } from "../../domain/visits-calendar-types";
import { Button } from "@/shared/ui/Button";

interface VisitsCalendarSummary {
  current: number;
  upcoming: number;
}

interface VisitsCalendarToolbarProps {
  anchorLabel: string;
  view: VisitsCalendarView;
  summary: VisitsCalendarSummary;
  onViewChange: (view: VisitsCalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const VIEW_OPTIONS: VisitsCalendarView[] = ["month", "week", "agenda"];

const VIEW_BUTTON_BASE_CLASS =
  "-mb-px flex min-h-11 items-center border-b-2 px-1 text-sm transition-colors";
const VIEW_BUTTON_ACTIVE_CLASS = "border-accent font-semibold text-ink-primary";
const VIEW_BUTTON_INACTIVE_CLASS =
  "border-transparent font-medium text-ink-secondary hover:text-ink-primary";

export function VisitsCalendarToolbar({
  anchorLabel,
  view,
  summary,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: VisitsCalendarToolbarProps) {
  const t = useTranslations("visits.calendar");
  const viewLabels: Record<VisitsCalendarView, string> = {
    month: t("month"),
    week: t("week"),
    agenda: t("agenda"),
  };

  return (
    <header className="flex flex-col gap-4 lg:flex-row-reverse lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-8 lg:gap-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6">
        <h2
          className="text-xl font-bold tracking-heading text-ink-primary"
          aria-live="polite"
        >
          {anchorLabel}
        </h2>

        <p className="flex flex-wrap items-center gap-x-2 font-mono text-sm text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <LogIn aria-hidden="true" className="size-3.5 shrink-0 text-success" />
            {t("summaryHereNow", { count: summary.current })}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t("summaryUpcoming", { count: summary.upcoming })}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={t("navigation")}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            aria-label={t("previous")}
            className="w-11 px-0"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>

          <Button type="button" variant="secondary" onClick={onToday}>
            {t("today")}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onNext}
            aria-label={t("next")}
            className="w-11 px-0"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div
          className="order-first flex flex-wrap gap-x-6 border-b border-border lg:order-none"
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
                className={`${VIEW_BUTTON_BASE_CLASS} ${
                  isSelected
                    ? VIEW_BUTTON_ACTIVE_CLASS
                    : VIEW_BUTTON_INACTIVE_CLASS
                }`}
              >
                {viewLabels[option]}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
