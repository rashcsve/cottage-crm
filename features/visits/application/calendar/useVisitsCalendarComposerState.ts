"use client";

import { useCallback, useMemo, useState } from "react";

import { getDefaultVisitEnd } from "../../domain/default-visit-end";
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

function createDefaultRange(iso: string): CalendarDateRange {
  return {
    dateFrom: iso,
    dateTo: getDefaultVisitEnd(iso),
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
    setComposerState((currentState) =>
      isComposerOpen(currentState)
        ? currentState
        : {
            mode: "open",
            draftRange: createDefaultRange(iso),
          },
    );
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
          : { dateFrom: iso, dateTo: iso },
      };
    });
  }, []);

  return {
    draftRange,
    isDraftMode: isComposerOpen(composerState),
    openComposer,
    closeComposer,
    resetComposer: closeComposer,
    syncDraftSelection,
  };
}
