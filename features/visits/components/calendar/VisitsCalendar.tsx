"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { AddItemPanel } from "@/shared/ui/AddItemPanel";
import { FormLoadBoundary } from "@/shared/ui/Form/FormLoadBoundary";
import type { Visit } from "../../types/visits";
import { useVisitsCalendarState } from "../../application/calendar/useVisitsCalendarState";
import type { VisitsCalendarUrlState } from "../../application/calendar/visits-calendar-url-state";
import { VisitsCalendarToolbar } from "./VisitsCalendarToolbar";
import { VisitsMonthView } from "./month/VisitsMonthView";
import { VisitsWeekView } from "./week/VisitsWeekView";
import { VisitsAgendaView } from "./VisitsAgendaView";
import { VisitsSelectedDayPanel } from "./VisitsSelectedDayPanel";

const NewVisitForm = dynamic(() =>
  import("../forms/NewVisitForm").then((module) => module.NewVisitForm),
);

const ADD_VISIT_PANEL_TITLE_ID = "visits-add-visit-panel-title";

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

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <VisitsCalendarToolbar
          anchorLabel={anchorLabel}
          view={urlState.view}
          summary={{ current: stats.current, upcoming: stats.upcoming }}
          onViewChange={handleViewChange}
          onPrevious={() => handleShiftPeriod(-1)}
          onNext={() => handleShiftPeriod(1)}
          onToday={handleToday}
        />
      </section>

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
            >
              <NewVisitForm
                draftRange={draftRange}
                currentUserName={currentUserName}
                onDirtyChange={setIsFormDirty}
                onCreateSuccess={handlePanelCreateSuccess}
              />
            </FormLoadBoundary>
          ) : null}
        </AddItemPanel>
      ) : null}

      {urlState.view === "month" && (
        <div className="space-y-6 xl:grid xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:gap-6 xl:space-y-0">
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
