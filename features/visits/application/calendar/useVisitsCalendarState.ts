"use client";

import { useCallback, useMemo } from "react";
import { useLocale } from "next-intl";

import {
  buildMonthWeeks,
  buildWeek,
  getAnchorLabel,
  getVisitsForDay,
  shiftAnchor,
} from "../../domain/visits-calendar";
import type {
  CalendarWeek,
  VisitsCalendarView,
} from "../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "./day-selection";
import type { VisitsCalendarUrlState } from "./visits-calendar-url-state";
import type { Visit } from "../../types/visits";
import {
  useVisitsCollectionState,
  type VisitsCollectionMessages,
} from "../useVisitsCollectionState";
import { useCalendarTodayIso } from "./useCalendarTodayIso";
import { useVisitsCalendarBrowserState } from "./useVisitsCalendarBrowserState";
import { useVisitsCalendarComposerState } from "./useVisitsCalendarComposerState";
import { useVisitsCalendarSelections } from "./useVisitsCalendarSelections";

interface UseVisitsCalendarStateArgs {
  initialVisits: Visit[];
  initialUrlState: VisitsCalendarUrlState;
  canManageVisits: boolean;
  todayIso: string;
  deleteMessages: VisitsCollectionMessages;
}

const EMPTY_CALENDAR_WEEKS: CalendarWeek[] = [];
const EMPTY_VISITS: Visit[] = [];

// Keeps only shareable navigation state in the URL; all interaction state lives in memory.
export function useVisitsCalendarState({
  initialVisits,
  initialUrlState,
  canManageVisits,
  todayIso,
  deleteMessages,
}: UseVisitsCalendarStateArgs) {
  const locale = useLocale();
  const effectiveTodayIso = useCalendarTodayIso(todayIso);
  const {
    draftRange,
    isDraftMode,
    openComposer: openComposerForDay,
    closeComposer: closeComposerState,
    resetComposer,
    syncDraftSelection,
  } = useVisitsCalendarComposerState();
  const {
    selectedMonthDayIso,
    selectedWeekDayIso,
    getActiveSelection,
    selectDay: selectExplicitDay,
    handleHistoryNavigation: handleSelectionHistoryNavigation,
    handleExternalStateSync: handleSelectionExternalStateSync,
    handlePeriodShift,
    handleToday: handleSelectionToday,
    getNextAnchorForViewChange,
    handleViewChange: handleSelectionViewChange,
    handleCreateSuccess: handleSelectionCreateSuccess,
  } = useVisitsCalendarSelections({
    initialUrlState,
    locale,
  });
  const handleHistoryNavigation = useCallback(
    (nextUrlState: VisitsCalendarUrlState) => {
      handleSelectionHistoryNavigation(nextUrlState);
    },
    [handleSelectionHistoryNavigation],
  );
  const handleExternalStateSync = useCallback(
    (nextUrlState: VisitsCalendarUrlState) => {
      resetComposer();
      handleSelectionExternalStateSync(nextUrlState);
    },
    [handleSelectionExternalStateSync, resetComposer],
  );
  const { urlState, commitUrlState, updateUrlState } =
    useVisitsCalendarBrowserState({
      initialUrlState,
      effectiveTodayIso,
      onHistoryNavigation: handleHistoryNavigation,
      onExternalStateSync: handleExternalStateSync,
    });
  const { orderedVisits, stats, handleDelete, registerCreatedVisit } =
    useVisitsCollectionState({
      initialVisits,
      todayIso: effectiveTodayIso,
      deleteMessages,
    });
  const selectedDateIso = urlState.anchorIso;
  const monthWeeks = useMemo(() => {
    if (urlState.view !== "month") {
      return EMPTY_CALENDAR_WEEKS;
    }

    return buildMonthWeeks({
      anchorIso: urlState.anchorIso,
      locale,
      visits: orderedVisits,
      todayIso: effectiveTodayIso,
    });
  }, [locale, orderedVisits, effectiveTodayIso, urlState.anchorIso, urlState.view]);
  const week = useMemo(() => {
    if (urlState.view !== "week") {
      return null;
    }

    return buildWeek({
      anchorIso: urlState.anchorIso,
      locale,
      visits: orderedVisits,
      todayIso: effectiveTodayIso,
    });
  }, [locale, orderedVisits, effectiveTodayIso, urlState.anchorIso, urlState.view]);
  const selectedDayVisits = useMemo(
    () =>
      urlState.view === "month"
        ? selectedMonthDayIso
          ? getVisitsForDay(orderedVisits, selectedMonthDayIso)
          : EMPTY_VISITS
        : EMPTY_VISITS,
    [orderedVisits, selectedMonthDayIso, urlState.view],
  );
  const anchorLabel = useMemo(
    () => getAnchorLabel(urlState.view, urlState.anchorIso, locale),
    [locale, urlState.anchorIso, urlState.view],
  );

  function syncSelection(iso: string, historyMode: "push" | "replace" = "replace") {
    updateUrlState((current) => ({ ...current, anchorIso: iso }), historyMode);
  }

  function openComposer(
    targetIso = getActiveSelection(urlState.view, selectedDateIso),
  ) {
    openComposerForDay(targetIso);
  }

  function closeComposer() {
    closeComposerState();
  }

  function selectDay({ iso, extendRange }: VisitsCalendarDaySelection) {
    syncSelection(iso, "replace");
    selectExplicitDay(urlState.view, iso);
    syncDraftSelection(iso, extendRange, canManageVisits);
  }

  function shiftPeriod(direction: -1 | 1) {
    const nextAnchorIso = shiftAnchor(
      urlState.view,
      urlState.anchorIso,
      direction,
    );

    syncSelection(nextAnchorIso);
    handlePeriodShift(urlState.view, nextAnchorIso);
  }

  function selectToday() {
    syncSelection(effectiveTodayIso, "replace");
    handleSelectionToday(urlState.view, effectiveTodayIso);
  }

  function changeView(nextView: VisitsCalendarView) {
    const nextAnchorIso = getNextAnchorForViewChange(
      urlState.view,
      urlState.anchorIso,
    );

    commitUrlState({
      view: nextView,
      anchorIso: nextAnchorIso,
    });
    handleSelectionViewChange(urlState.view, nextView, nextAnchorIso);
  }

  function handleCreateSuccess(visit: Visit) {
    registerCreatedVisit(visit);
    resetComposer();
    syncSelection(visit.dateFrom, "replace");
    handleSelectionCreateSuccess(urlState.view, visit.dateFrom);
  }

  return {
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
    handleViewChange: changeView,
    handleShiftPeriod: shiftPeriod,
    handleToday: selectToday,
    handleSelectDay: selectDay,
    handleOpenComposer: openComposer,
    handleCloseComposer: closeComposer,
    handleCreateSuccess,
  };
}
