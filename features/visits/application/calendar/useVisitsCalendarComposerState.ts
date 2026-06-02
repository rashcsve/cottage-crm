"use client";

import { useCallback, useMemo, useState } from "react";

import { normalizeCalendarRange } from "../../domain/visits-calendar";
import type { CalendarDateRange } from "../../domain/visits-calendar-types";

interface ClosedComposerState {
  mode: "closed";
}

interface OpenComposerState {
  mode: "open";
  draftRange: CalendarDateRange;
}

type ComposerState = ClosedComposerState | OpenComposerState;

function createSingleDayRange(iso: string): CalendarDateRange {
  return {
    dateFrom: iso,
    dateTo: iso,
  };
}

function isComposerOpen(state: ComposerState): state is OpenComposerState {
  return state.mode === "open";
}

export function useVisitsCalendarComposerState() {
  const [composerState, setComposerState] = useState<ComposerState>({
    mode: "closed",
  });

  const draftRange = useMemo(
    () => (isComposerOpen(composerState) ? composerState.draftRange : null),
    [composerState],
  );

  const openComposer = useCallback((iso: string) => {
    setComposerState({
      mode: "open",
      draftRange: createSingleDayRange(iso),
    });
  }, []);

  const closeComposer = useCallback(() => {
    setComposerState({ mode: "closed" });
  }, []);

  const syncDraftSelection = useCallback((
    iso: string,
    extendRange: boolean,
    canManageVisits: boolean,
  ) => {
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
  }, []);

  return {
    draftRange,
    isComposerOpen: isComposerOpen(composerState),
    openComposer,
    closeComposer,
    resetComposer: closeComposer,
    syncDraftSelection,
  };
}
