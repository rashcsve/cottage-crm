"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import {
  buildMonthWeeks,
  buildWeek,
  getAnchorLabel,
  getVisitsForDay,
  isDayVisibleInMonthGrid,
  normalizeCalendarRange,
  shiftAnchor,
} from "../../domain/visits-calendar";
import type {
  CalendarDateRange,
  CalendarWeek,
  VisitsCalendarView,
} from "../../domain/visits-calendar-types";
import type { VisitsCalendarDaySelection } from "./day-selection";
import {
  mergeVisitsCalendarSearchParams,
  readVisitsCalendarLocationState,
  type VisitsCalendarUrlState,
} from "./visits-calendar-url-state";
import type { Visit } from "../../types/visits";
import {
  useVisitsCollectionState,
  type VisitsCollectionMessages,
} from "../useVisitsCollectionState";

interface UseVisitsCalendarStateArgs {
  initialVisits: Visit[];
  initialUrlState: VisitsCalendarUrlState;
  canManageVisits: boolean;
  todayIso: string;
  deleteMessages: VisitsCollectionMessages;
}

interface ClosedComposerState {
  mode: "closed";
}

interface OpenComposerState {
  mode: "open";
  draftRange: CalendarDateRange;
}

type ComposerState = ClosedComposerState | OpenComposerState;

const EMPTY_CALENDAR_WEEKS: CalendarWeek[] = [];
const EMPTY_VISITS: Visit[] = [];
const NO_SELECTED_MONTH_DAY = null;
const NO_SELECTED_WEEK_DAY = null;

function createSingleDayRange(iso: string): CalendarDateRange {
  return {
    dateFrom: iso,
    dateTo: iso,
  };
}

function isComposerOpen(state: ComposerState): state is OpenComposerState {
  return state.mode === "open";
}

function getClientTodayIso() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

function subscribeToTodayChange(onStoreChange: () => void) {
  const intervalId = window.setInterval(onStoreChange, 60 * 60 * 1000);

  return () => window.clearInterval(intervalId);
}

/**
 * Coordinates client-side calendar interaction state while keeping only the
 * shareable navigation state in the URL.
 */
export function useVisitsCalendarState({
  initialVisits,
  initialUrlState,
  canManageVisits,
  todayIso,
  deleteMessages,
}: UseVisitsCalendarStateArgs) {
  const locale = useLocale();
  const [urlState, setUrlState] = useState(initialUrlState);
  const urlStateRef = useRef(initialUrlState);
  const [composerState, setComposerState] = useState<ComposerState>({
    mode: "closed",
  });
  const [selectedMonthDayIso, setSelectedMonthDayIso] = useState<string | null>(
    initialUrlState.view === "month" ? initialUrlState.anchorIso : NO_SELECTED_MONTH_DAY,
  );
  const [selectedWeekDayIso, setSelectedWeekDayIso] = useState<string | null>(
    NO_SELECTED_WEEK_DAY,
  );
  // Keep the initial server value for hydration, then subscribe to the user's
  // local date so a long-lived tab stays aligned with the real local "today".
  const effectiveTodayIso = useSyncExternalStore(
    subscribeToTodayChange,
    getClientTodayIso,
    () => todayIso,
  );
  // The URL anchor is the durable, shareable period state. Month and week keep
  // their own explicit local selections so browsing periods never invents a
  // day choice the user did not make.
  const selectedDateIso = urlState.anchorIso;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId: number | null = null;
    const initialLocationState = readVisitsCalendarLocationState(
      new URLSearchParams(window.location.search),
      effectiveTodayIso,
    );

    if (
      initialLocationState.urlState.view !== urlStateRef.current.view ||
      initialLocationState.urlState.anchorIso !== urlStateRef.current.anchorIso
    ) {
      urlStateRef.current = initialLocationState.urlState;
      frameId = window.requestAnimationFrame(() => {
        setUrlState(initialLocationState.urlState);
      });
    }

    if (initialLocationState.shouldCanonicalize) {
      const nextQuery = initialLocationState.canonicalSearchParams.toString();
      const nextHref = `${window.location.pathname}${
        nextQuery ? `?${nextQuery}` : ""
      }${window.location.hash}`;

      window.history.replaceState(null, "", nextHref);
    }

    function handlePopState() {
      const nextLocationState = readVisitsCalendarLocationState(
        new URLSearchParams(window.location.search),
        effectiveTodayIso,
      );

      urlStateRef.current = nextLocationState.urlState;
      setUrlState(nextLocationState.urlState);

      if (nextLocationState.urlState.view === "month") {
        setSelectedMonthDayIso((current) =>
          current &&
          isDayVisibleInMonthGrid(
            nextLocationState.urlState.anchorIso,
            locale,
            current,
          )
            ? current
            : NO_SELECTED_MONTH_DAY,
        );
      }

      setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);

      if (nextLocationState.shouldCanonicalize) {
        const nextQuery = nextLocationState.canonicalSearchParams.toString();
        const nextHref = `${window.location.pathname}${
          nextQuery ? `?${nextQuery}` : ""
        }${window.location.hash}`;

        window.history.replaceState(null, "", nextHref);
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("popstate", handlePopState);
    };
  }, [effectiveTodayIso, locale]);

  const { orderedVisits, stats, handleDelete, registerCreatedVisit } =
    useVisitsCollectionState({
      initialVisits,
      todayIso: effectiveTodayIso,
      deleteMessages,
    });
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
  const draftRange = isComposerOpen(composerState)
    ? composerState.draftRange
    : null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const locationUrlState = readVisitsCalendarLocationState(
      new URLSearchParams(window.location.search),
      effectiveTodayIso,
    ).urlState;

    if (
      locationUrlState.view !== initialUrlState.view ||
      locationUrlState.anchorIso !== initialUrlState.anchorIso
    ) {
      return;
    }

    if (
      initialUrlState.view === urlStateRef.current.view &&
      initialUrlState.anchorIso === urlStateRef.current.anchorIso
    ) {
      return;
    }

    urlStateRef.current = initialUrlState;
    setUrlState(initialUrlState);
    setComposerState({ mode: "closed" });
    setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
    setSelectedMonthDayIso(
      initialUrlState.view === "month"
        ? initialUrlState.anchorIso
        : NO_SELECTED_MONTH_DAY,
    );
  }, [effectiveTodayIso, initialUrlState]);

  function writeBrowserUrl(
    nextUrlState: VisitsCalendarUrlState,
    historyMode: "push" | "replace" = "push",
  ) {
    if (typeof window === "undefined") {
      return;
    }

    const nextSearchParams = mergeVisitsCalendarSearchParams(
      new URLSearchParams(window.location.search),
      nextUrlState,
    );
    const nextQuery = nextSearchParams.toString();
    const nextHref = `${window.location.pathname}${
      nextQuery ? `?${nextQuery}` : ""
    }${window.location.hash}`;

    if (historyMode === "replace") {
      window.history.replaceState(null, "", nextHref);
      return;
    }

    window.history.pushState(null, "", nextHref);
  }

  function commitUrlState(
    nextUrlState: VisitsCalendarUrlState,
    historyMode: "push" | "replace" = "push",
  ) {
    urlStateRef.current = nextUrlState;
    setUrlState(nextUrlState);
    writeBrowserUrl(nextUrlState, historyMode);
  }

  function updateUrlState(
    updater:
      | VisitsCalendarUrlState
      | ((current: VisitsCalendarUrlState) => VisitsCalendarUrlState),
    historyMode: "push" | "replace" = "push",
  ) {
    const nextUrlState =
      typeof updater === "function"
        ? updater(urlStateRef.current)
        : updater;

    commitUrlState(nextUrlState, historyMode);
  }

  function setComposerToSingleDay(iso: string) {
    setComposerState({
      mode: "open",
      draftRange: createSingleDayRange(iso),
    });
  }

  function syncSelection(iso: string, historyMode: "push" | "replace" = "replace") {
    updateUrlState((current) => ({ ...current, anchorIso: iso }), historyMode);
  }

  function openComposer(
    targetIso =
      urlState.view === "month"
        ? selectedMonthDayIso ?? selectedDateIso
        : urlState.view === "week"
        ? selectedWeekDayIso ?? selectedDateIso
        : selectedDateIso,
  ) {
    setComposerToSingleDay(targetIso);
  }

  function closeComposer() {
    setComposerState({ mode: "closed" });
  }

  function selectDay({ iso, extendRange }: VisitsCalendarDaySelection) {
    syncSelection(iso, "replace");

    if (urlState.view === "month") {
      setSelectedMonthDayIso(iso);
    }

    if (urlState.view === "week") {
      setSelectedWeekDayIso(iso);
    }

    setComposerState((currentState) => {
      if (!canManageVisits || currentState.mode !== "open") {
        return currentState;
      }

      return {
        mode: "open",
        draftRange: extendRange
          ? normalizeCalendarRange(currentState.draftRange.dateFrom, iso)
          : createSingleDayRange(iso),
      };
    });
  }

  function shiftPeriod(direction: -1 | 1) {
    const nextAnchorIso = shiftAnchor(
      urlState.view,
      urlState.anchorIso,
      direction,
    );

    syncSelection(nextAnchorIso);

    if (urlState.view === "week") {
      setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
      return;
    }

    if (urlState.view === "month") {
      setSelectedMonthDayIso((current) =>
        current && isDayVisibleInMonthGrid(nextAnchorIso, locale, current)
          ? current
          : NO_SELECTED_MONTH_DAY,
      );
    }
  }

  function selectToday() {
    syncSelection(effectiveTodayIso, "replace");

    if (urlState.view === "week") {
      setSelectedWeekDayIso(NO_SELECTED_WEEK_DAY);
      return;
    }

    if (urlState.view === "month") {
      setSelectedMonthDayIso(effectiveTodayIso);
    }
  }

  function changeView(nextView: VisitsCalendarView) {
    const nextAnchorIso =
      urlState.view === "week"
        ? selectedWeekDayIso ?? urlState.anchorIso
        : urlState.view === "month"
        ? selectedMonthDayIso ?? urlState.anchorIso
        : selectedDateIso;

    commitUrlState({
      view: nextView,
      anchorIso: nextAnchorIso,
    });

    if (nextView === "week") {
      setSelectedWeekDayIso(
        urlState.view === "week"
          ? selectedWeekDayIso
          : urlState.view === "month"
          ? selectedMonthDayIso
          : NO_SELECTED_WEEK_DAY,
      );
    }

    if (nextView === "month") {
      const nextMonthSelection =
        urlState.view === "month"
          ? selectedMonthDayIso
          : urlState.view === "week"
          ? selectedWeekDayIso
          : NO_SELECTED_MONTH_DAY;

      setSelectedMonthDayIso(
        nextMonthSelection &&
          isDayVisibleInMonthGrid(nextAnchorIso, locale, nextMonthSelection)
          ? nextMonthSelection
          : NO_SELECTED_MONTH_DAY,
      );
    }
  }

  function handleCreateSuccess(visit: Visit) {
    registerCreatedVisit(visit);
    setComposerState({ mode: "closed" });
    syncSelection(visit.dateFrom, "replace");

    if (urlState.view === "month") {
      setSelectedMonthDayIso(visit.dateFrom);
    }

    if (urlState.view === "week") {
      setSelectedWeekDayIso(visit.dateFrom);
    }
  }

  return {
    anchorLabel,
    urlState,
    selectedMonthDayIso,
    selectedWeekDayIso,
    isComposerOpen: isComposerOpen(composerState),
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
