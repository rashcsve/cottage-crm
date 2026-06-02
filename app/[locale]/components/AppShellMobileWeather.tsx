import { getCurrentCottageWeather } from "@/features/dashboard/server/weather";
import { getTranslations } from "next-intl/server";

export async function AppShellMobileWeather() {
  const [weather, t] = await Promise.all([
    getCurrentCottageWeather(),
    getTranslations("appShell"),
  ]);

  if (weather.status !== "available") return null;

  return (
    <span
      className="shrink-0"
      aria-label={t("weatherLabel", { temperature: weather.temperatureC })}
    >
      <span aria-hidden="true">· {weather.temperatureC}°C</span>
    </span>
  );
}
