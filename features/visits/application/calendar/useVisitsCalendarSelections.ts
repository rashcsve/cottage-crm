"use client";

import { useCallback, useState } from "react";

import { isDayVisibleInMonthGrid } from "../../domain/visits-calendar";
import type { VisitsCalendarView } from "../../domain/visits-calendar-types";
import type { VisitsCalendarUrlState } from "./visits-calendar-url-state";

const NO_SELECTED_MONTH_DAY = null;
const NO_SELECTED_WEEK_DAY = null;

interface UseVisitsCalendarSelectionsArgs {
  initialUrlState: VisitsCalendarUrlState;
  locale: string;
}

export function useVisitsCalendarSelections({
  initialUrlState,
  locale,
}: UseVisitsCalendarSelectionsArgs) {
  const [selectedMonthDayIso, setSelectedMonthDayIso] = useState<string | null>(
    initialUrlState.view === "month"
      ? initialUrlState.anchorIso
      : NO_SELECTED_MONTH_DAY,
  );
  const [selectedWeekDayIso, setSelectedWeekDayIso] = useState<string | null>(
    NO_SELECTED_WEEK_DAY,
  );

  const getActiveSelection = useCallback((
    view: VisitsCalendarView,
    anchorIso: string,
  ) => {
    if (view === "month") {
      return selectedMonthDayIso ?? anchorIso;
    }

    if (view === "week") {
      return selectedWeekDayIso ?? anchorIso;
    }

    return anchorIso;
  }, [selectedMonthDayIso, selectedWeekDayIso]);

  const selectDay = useCallback((view: VisitsCalendarView, iso: string) => {
    if (view === "month") {
      setSelectedMonthDayIso(iso);
    }

    if (view === "week") {
      setSelectedWeekDayIso(iso);
    }
  }, []);

  const handleHistoryNavigation = useCallback((nextUrlState: VisitsCalendarUrlState) => {
    if (nextUrlState.view === "month") {
      setSelectedMonthDayIso((current) =>
        current &&
        isDayVisibleInMonthGrid(nextUrlState.anchorIso, locale, current)
          ? current
          : NO_SELECTED_MONTH_DAY,
      );
    }

    setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
  }, [locale]);

  const handleExternalStateSync = useCallback((nextUrlState: VisitsCalendarUrlState) => {
    setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
    setSelectedMonthDayIso(
      nextUrlState.view === "month"
        ? nextUrlState.anchorIso
        : NO_SELECTED_MONTH_DAY,
    );
  }, []);

  const handlePeriodShift = useCallback((
    view: VisitsCalendarView,
    nextAnchorIso: string,
  ) => {
    if (view === "week") {
      setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
      return;
    }

    if (view === "month") {
      setSelectedMonthDayIso((current) =>
        current && isDayVisibleInMonthGrid(nextAnchorIso, locale, current)
          ? current
          : NO_SELECTED_MONTH_DAY,
      );
    }
  }, [locale]);

  const handleToday = useCallback((view: VisitsCalendarView, todayIso: string) => {
    if (view === "week") {
      setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
      return;
    }

    if (view === "month") {
      setSelectedMonthDayIso(todayIso);
    }
  }, []);

  const getNextAnchorForViewChange = useCallback((
    currentView: VisitsCalendarView,
    currentAnchorIso: string,
  ) => {
    if (currentView === "week") {
      return selectedWeekDayIso ?? currentAnchorIso;
    }

    if (currentView === "month") {
      return selectedMonthDayIso ?? currentAnchorIso;
    }

    return currentAnchorIso;
  }, [selectedMonthDayIso, selectedWeekDayIso]);

  const handleViewChange = useCallback((
    currentView: VisitsCalendarView,
    nextView: VisitsCalendarView,
    nextAnchorIso: string,
  ) => {
    if (nextView === "week") {
      setSelectedWeekDayIso(
        currentView === "week"
          ? selectedWeekDayIso
          : currentView === "month"
            ? selectedMonthDayIso
            : NO_SELECTED_WEEK_DAY,
      );
    }

    if (nextView === "month") {
      const nextMonthSelection =
        currentView === "month"
          ? selectedMonthDayIso
          : currentView === "week"
            ? selectedWeekDayIso
            : NO_SELECTED_MONTH_DAY;

      setSelectedMonthDayIso(
        nextMonthSelection &&
          isDayVisibleInMonthGrid(nextAnchorIso, locale, nextMonthSelection)
          ? nextMonthSelection
          : NO_SELECTED_MONTH_DAY,
      );
    }
  }, [locale, selectedMonthDayIso, selectedWeekDayIso]);

  const handleCreateSuccess = useCallback((view: VisitsCalendarView, iso: string) => {
    if (view === "month") {
      setSelectedMonthDayIso(iso);
    }

    if (view === "week") {
      setSelectedWeekDayIso(iso);
    }
  }, []);

  return {
    selectedMonthDayIso,
    selectedWeekDayIso,
    getActiveSelection,
    selectDay,
    handleHistoryNavigation,
    handleExternalStateSync,
    handlePeriodShift,
    handleToday,
    getNextAnchorForViewChange,
    handleViewChange,
    handleCreateSuccess,
  };
}
