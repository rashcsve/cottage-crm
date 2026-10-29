"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { AddItemPanel } from "@/shared/ui/AddItemPanel";
import { FormLoadBoundary } from "@/shared/ui/Form/FormLoadBoundary";
import { Button } from "@/shared/ui/Button";
import type { Couple, CoupleId } from "../../domain/couples";
import type { Visit } from "../../types/visits";
import { useVisitsCalendarState } from "../../application/calendar/useVisitsCalendarState";
import type { VisitsCalendarUrlState } from "../../application/calendar/visits-calendar-url-state";
import { NewVisitFormSkeleton } from "../forms/NewVisitFormSkeleton";
import { VisitsCalendarToolbar } from "./VisitsCalendarToolbar";
import { VisitsMonthView } from "./month/VisitsMonthView";
import { VisitsWeekView } from "./week/VisitsWeekView";
import { VisitsAgendaView } from "./VisitsAgendaView";
import { VisitsSelectedDayPanel } from "./VisitsSelectedDayPanel";
import {
  formatVisitCompactDate,
  formatVisitFullDate,
  formatVisitWeekRangeLabel,
} from "../../shared/formatVisitDate";

const NewVisitForm = dynamic(() =>
  import("../forms/NewVisitForm").then((module) => module.NewVisitForm),
);

const ADD_VISIT_PANEL_TITLE_ID = "visits-add-visit-panel-title";

interface VisitsCalendarProps {
  visits: Visit[];
  canManageVisits: boolean;
  todayIso: string;
  currentUserName: string;
  currentUserCouple: CoupleId | null;
  couples: Couple[];
  initialUrlState: VisitsCalendarUrlState;
}

export function VisitsCalendar({
  visits: initialVisits,
  canManageVisits,
  todayIso,
  currentUserName,
  currentUserCouple,
  couples,
  initialUrlState,
}: VisitsCalendarProps) {
  const locale = useLocale();
  const tDelete = useTranslations("visits.delete");
  const tForm = useTranslations("visits.form");
  const tCommon = useTranslations("common");
  const tCalendar = useTranslations("visits.calendar");
  const [isFormDirty, setIsFormDirty] = useState(false);

  const {
    anchorLabel,
    urlState,
    selectedMonthDayIso,
    selectedWeekDayIso,
    isDraftMode,
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
      retry: tDelete("retry"),
    },
  });

  const addVisitAction = canManageVisits
    ? {
        label: tForm("openComposer"),
        onClick: () => handleOpenComposer(),
      }
    : undefined;

  function closePanel() {
    setIsFormDirty(false);
    handleCloseComposer();
  }

  function handlePanelCreateSuccess(visit: Visit) {
    setIsFormDirty(false);
    handleCreateSuccess(visit);
  }

  const deleteVisit = canManageVisits ? handleDelete : undefined;
  const weekStart = week?.days[0];
  const weekEnd = week?.days[6];
  const mobileAnchorLabel =
    weekStart && weekEnd
      ? formatVisitWeekRangeLabel(weekStart.iso, weekEnd.iso, locale, "mobile")
      : anchorLabel;

  return (
    <div className="space-y-3 lg:space-y-6">
      <VisitsCalendarToolbar
        anchorLabel={anchorLabel}
        mobileAnchorLabel={mobileAnchorLabel}
        view={urlState.view}
        summary={{ current: stats.current, upcoming: stats.upcoming }}
        onViewChange={handleViewChange}
        onPrevious={() => handleShiftPeriod(-1)}
        onNext={() => handleShiftPeriod(1)}
        onToday={handleToday}
      />

      {canManageVisits ? (
        <AddItemPanel
          open={isDraftMode}
          onClose={closePanel}
          title={tForm("title")}
          titleId={ADD_VISIT_PANEL_TITLE_ID}
          closeLabel={tForm("closeComposer")}
          modal={false}
          isDirty={isFormDirty}
          discard={{
            message: tForm("discardMessage"),
            confirmLabel: tCommon("addPanel.discardConfirm"),
            cancelLabel: tCommon("addPanel.discardCancel"),
          }}
        >
          {isDraftMode ? (
            <FormLoadBoundary
              message={tCommon("formLoadError")}
              reloadLabel={tCommon("reloadPage")}
              loadingLabel={tCommon("loading")}
              skeleton={
                <NewVisitFormSkeleton
                  coupleCount={couples.length}
                  hasSelectedRange={draftRange !== null}
                />
              }
            >
              <NewVisitForm
                draftRange={draftRange}
                currentUserName={currentUserName}
                currentUserCouple={currentUserCouple}
                couples={couples}
                onDirtyChange={setIsFormDirty}
                onCreateSuccess={handlePanelCreateSuccess}
              />
            </FormLoadBoundary>
          ) : null}
        </AddItemPanel>
      ) : null}

      {urlState.view === "month" && (
        <div className="flex flex-col gap-3 lg:gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
          <div className="lg:flex lg:min-h-[calc(100dvh-15.75rem)] lg:flex-col">
            <VisitsMonthView
              weeks={monthWeeks}
              selectedDateIso={selectedMonthDayIso}
              draftRange={draftRange}
              onSelectDay={handleSelectDay}
            />
          </div>

          <div className="xl:sticky xl:top-24">
            <VisitsSelectedDayPanel
              dateIso={selectedMonthDayIso}
              visits={selectedDayVisits}
              isDraftMode={isDraftMode}
              onAddVisit={
                selectedMonthDayIso
                  ? () => handleOpenComposer(selectedMonthDayIso)
                  : undefined
              }
              canManageVisits={canManageVisits}
              onDelete={canManageVisits ? handleDelete : undefined}
            />
          </div>

          {canManageVisits && selectedMonthDayIso ? (
            <div className="sticky bottom-(--mobile-nav-height,0px) z-10 border-t border-border bg-surface p-3 lg:hidden">
              <Button
                type="button"
                onClick={() => handleOpenComposer(selectedMonthDayIso)}
                aria-label={tCalendar("planStayOnDay", {
                  date: formatVisitFullDate(selectedMonthDayIso, locale),
                })}
                className="w-full min-h-12 justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="size-4 shrink-0" aria-hidden="true" />
                  {tCalendar("planStay")}
                </span>
                <span className="font-mono text-xs">
                  {formatVisitCompactDate(selectedMonthDayIso, locale)}
                </span>
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {urlState.view === "week" && week && (
        <VisitsWeekView
          week={week}
          selectedDateIso={selectedWeekDayIso}
          draftRange={draftRange}
          isDraftMode={isDraftMode}
          onAddVisit={handleOpenComposer}
          onSelectDay={handleSelectDay}
          canManageVisits={canManageVisits}
          onDelete={deleteVisit}
        />
      )}

      {urlState.view === "agenda" && (
        <VisitsAgendaView
          visits={orderedVisits}
          anchorIso={urlState.anchorIso}
          canManageVisits={canManageVisits}
          addVisitAction={addVisitAction}
          onDelete={deleteVisit}
        />
      )}
    </div>
  );
}
