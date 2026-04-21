"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { NewVisitForm } from "../forms/NewVisitForm";
import type { Visit } from "../../types/visits";
import { useVisitsCalendarState } from "../../application/calendar/useVisitsCalendarState";
import type { VisitsCalendarUrlState } from "../../application/calendar/visits-calendar-url-state";
import {
  VisitsCalendarToolbar,
  type VisitsCalendarToolbarAction,
} from "./VisitsCalendarToolbar";
import { VisitsMonthView } from "./month/VisitsMonthView";
import { VisitsWeekView } from "./week/VisitsWeekView";
import { VisitsAgendaView } from "./VisitsAgendaView";
import { VisitsSelectedDayPanel } from "./VisitsSelectedDayPanel";

interface VisitsCalendarProps {
  visits: Visit[];
  canManageVisits: boolean;
  todayIso: string;
  currentUserName: string;
  initialUrlState: VisitsCalendarUrlState;
}

export function VisitsCalendar({
  visits: initialVisits,
  canManageVisits,
  todayIso,
  currentUserName,
  initialUrlState,
}: VisitsCalendarProps) {
  const tDelete = useTranslations("visits.delete");
  const tForm = useTranslations("visits.form");
  const tCommon = useTranslations("common");
  const tStats = useTranslations("visits.stats");

  const composerRef = useRef<HTMLDivElement>(null);

  const {
    anchorLabel,
    urlState,
    selectedMonthDayIso,
    selectedWeekDayIso,
    isComposerOpen,
    draftRange,
    orderedVisits,
    stats,
    monthWeeks,
    week,
    selectedDayVisits,
    handleDelete,
    handleViewChange,
    handleShiftPeriod,
    handleToday,
    handleSelectDay,
    handleOpenComposer,
    handleCloseComposer,
    handleCreateSuccess,
  } = useVisitsCalendarState({
    initialVisits,
    initialUrlState,
    canManageVisits,
    todayIso,
    deleteMessages: {
      success: tDelete("success"),
      restored: tDelete("restored"),
      undo: tDelete("undo"),
      fallbackError: tCommon("error"),
    },
  });

  useEffect(() => {
    if (!isComposerOpen) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frameId = requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [isComposerOpen]);

  const summaryItems = [
    {
      id: "upcoming" as const,
      label: tStats("upcoming"),
      value: stats.upcoming,
      tone: "warning" as const,
    },
    {
      id: "current" as const,
      label: tStats("current"),
      value: stats.current,
      tone: "success" as const,
    },
    {
      id: "past" as const,
      label: tStats("past"),
      value: stats.past,
      tone: "neutral" as const,
    },
  ];

  const primaryAction: VisitsCalendarToolbarAction | undefined =
    canManageVisits && !isComposerOpen && urlState.view === "agenda"
      ? {
          label: tForm("openComposer"),
          onClick: () => handleOpenComposer(),
          icon: Plus,
        }
      : undefined;

  const deleteVisit = canManageVisits ? handleDelete : undefined;

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
        <VisitsCalendarToolbar
          anchorLabel={anchorLabel}
          view={urlState.view}
          summaryItems={summaryItems}
          primaryAction={primaryAction}
          onViewChange={handleViewChange}
          onPrevious={() => handleShiftPeriod(-1)}
          onNext={() => handleShiftPeriod(1)}
          onToday={handleToday}
        />

        {canManageVisits && isComposerOpen && (
          <div
            ref={composerRef}
            className="border-t border-stone-200 bg-stone-50 px-3 py-4 sm:px-5 sm:py-5"
          >
            <NewVisitForm
              draftRange={draftRange}
              currentUserName={currentUserName}
              onClose={handleCloseComposer}
              onCreateSuccess={handleCreateSuccess}
              variant="embedded"
            />
          </div>
        )}
      </section>

      {urlState.view === "month" && (
        <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start xl:gap-5 xl:space-y-0">
          <div>
            <VisitsMonthView
              weeks={monthWeeks}
              selectedDateIso={selectedMonthDayIso}
              draftRange={draftRange}
              onSelectDay={handleSelectDay}
            />
          </div>

          <div className="xl:sticky xl:top-6">
            <VisitsSelectedDayPanel
              dateIso={selectedMonthDayIso}
              visits={selectedDayVisits}
              isComposerOpen={isComposerOpen}
              onAddVisit={
                selectedMonthDayIso
                  ? () => handleOpenComposer(selectedMonthDayIso)
                  : undefined
              }
              canManageVisits={canManageVisits}
              onDelete={canManageVisits ? handleDelete : undefined}
            />
          </div>
        </div>
      )}

      {urlState.view === "week" && week && (
        <VisitsWeekView
          week={week}
          anchorLabel={anchorLabel}
          selectedDateIso={selectedWeekDayIso}
          draftRange={draftRange}
          isComposerOpen={isComposerOpen}
          onAddVisit={handleOpenComposer}
          onSelectDay={handleSelectDay}
          onPreviousWeek={() => handleShiftPeriod(-1)}
          onNextWeek={() => handleShiftPeriod(1)}
          canManageVisits={canManageVisits}
          onDelete={deleteVisit}
        />
      )}

      {urlState.view === "agenda" && (
        <VisitsAgendaView
          visits={orderedVisits}
          anchorIso={urlState.anchorIso}
          canManageVisits={canManageVisits}
          onDelete={deleteVisit}
        />
      )}
    </div>
  );
}
