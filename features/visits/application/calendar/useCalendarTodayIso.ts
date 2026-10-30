"use client";

import { useSyncExternalStore } from "react";
import { getTodayIso } from "@/lib/utils/date";

function getClientTodayIso() {
  return getTodayIso();
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
