"use client";

import { useEffect, useRef, useState } from "react";

import {
  mergeVisitsCalendarSearchParams,
  readVisitsCalendarLocationState,
  type VisitsCalendarUrlState,
} from "./visits-calendar-url-state";

interface UseVisitsCalendarBrowserStateArgs {
  initialUrlState: VisitsCalendarUrlState;
  effectiveTodayIso: string;
  onHistoryNavigation: (nextUrlState: VisitsCalendarUrlState) => void;
  onExternalStateSync: (nextUrlState: VisitsCalendarUrlState) => void;
}

function buildLocationHref(searchParams: URLSearchParams) {
  const nextQuery = searchParams.toString();

  return `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
}

function replaceLocationFromSearchParams(searchParams: URLSearchParams) {
  window.history.replaceState(null, "", buildLocationHref(searchParams));
}

export function useVisitsCalendarBrowserState({
  initialUrlState,
  effectiveTodayIso,
  onHistoryNavigation,
  onExternalStateSync,
}: UseVisitsCalendarBrowserStateArgs) {
  const [urlState, setUrlState] = useState(initialUrlState);
  const urlStateRef = useRef(initialUrlState);

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
      onHistoryNavigation(initialLocationState.urlState);
      frameId = window.requestAnimationFrame(() => {
        setUrlState(initialLocationState.urlState);
      });
    }

    if (initialLocationState.shouldCanonicalize) {
      replaceLocationFromSearchParams(initialLocationState.canonicalSearchParams);
    }

    function handlePopState() {
      const nextLocationState = readVisitsCalendarLocationState(
        new URLSearchParams(window.location.search),
        effectiveTodayIso,
      );

      urlStateRef.current = nextLocationState.urlState;
      setUrlState(nextLocationState.urlState);
      onHistoryNavigation(nextLocationState.urlState);

      if (nextLocationState.shouldCanonicalize) {
        replaceLocationFromSearchParams(nextLocationState.canonicalSearchParams);
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("popstate", handlePopState);
    };
  }, [effectiveTodayIso, onHistoryNavigation]);

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

    let frameId: number | null = null;

    urlStateRef.current = initialUrlState;
    onExternalStateSync(initialUrlState);
    frameId = window.requestAnimationFrame(() => {
      setUrlState(initialUrlState);
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [effectiveTodayIso, initialUrlState, onExternalStateSync]);

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
    const nextHref = buildLocationHref(nextSearchParams);

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

  return {
    urlState,
    commitUrlState,
    updateUrlState,
  };
}
