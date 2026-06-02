import { getCurrentCottageWeather } from "@/features/dashboard/server/weather";
import { getTranslations } from "next-intl/server";

import { NavWeatherChip } from "./NavWeatherChip";

interface AppShellWeatherChipProps {
  className: string;
}

export async function AppShellWeatherChip({ className }: AppShellWeatherChipProps) {
  const [weather, t] = await Promise.all([
    getCurrentCottageWeather(),
    getTranslations("appShell"),
  ]);

  const ariaLabel =
    weather.status === "available"
      ? t("weatherLabel", { temperature: weather.temperatureC })
      : undefined;

  return <NavWeatherChip weather={weather} className={className} ariaLabel={ariaLabel} />;
}
