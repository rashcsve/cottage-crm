"use client";

import { useEffect, useState } from "react";

import { createDemoWeather } from "@/features/dashboard/shared/createDemoWeather";
import type { DashboardWeather } from "@/features/dashboard/types/dashboard";

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  process.env.NEXT_PUBLIC_E2E_MOCKS === "1";

let cachedWeather: DashboardWeather | null = null;
let weatherRequest: Promise<DashboardWeather> | null = null;

function getInitialWeather(): DashboardWeather | null {
  if (isDemoMode) {
    return createDemoWeather();
  }

  return cachedWeather;
}

async function fetchWeather(): Promise<DashboardWeather> {
  if (isDemoMode) {
    return createDemoWeather();
  }

  if (cachedWeather !== null) {
    return cachedWeather;
  }

  if (weatherRequest !== null) {
    return weatherRequest;
  }

  weatherRequest = fetch("/api/weather")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(String(response.status));
      }

      return (await response.json()) as DashboardWeather;
    })
    .catch(() => ({ status: "unavailable" } as const))
    .then((weather) => {
      cachedWeather = weather;
      return weather;
    })
    .finally(() => {
      weatherRequest = null;
    });

  return weatherRequest;
}

export function useClientWeather() {
  const [weather, setWeather] = useState<DashboardWeather | null>(getInitialWeather);

  useEffect(() => {
    if (weather !== null) {
      return;
    }

    let isCancelled = false;

    void fetchWeather().then((nextWeather) => {
      if (!isCancelled) {
        setWeather(nextWeather);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [weather]);

  return weather;
}
