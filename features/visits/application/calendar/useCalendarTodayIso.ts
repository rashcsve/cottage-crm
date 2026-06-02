"use client";

import { useSyncExternalStore } from "react";

function getClientTodayIso() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

function subscribeToTodayChange(onStoreChange: () => void) {
  const intervalId = window.setInterval(onStoreChange, 60 * 60 * 1000);

  return () => window.clearInterval(intervalId);
}

export function useCalendarTodayIso(todayIso: string) {
  return useSyncExternalStore(
    subscribeToTodayChange,
    getClientTodayIso,
    () => todayIso,
  );
}
