import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { WEATHER_CONDITION_KEYS } from "@/features/dashboard/domain/weather";
import type { DashboardWeather } from "@/features/dashboard/types/dashboard";
import type {
  DashboardWeatherConditionLabels,
  DashboardWeatherLabels,
} from "@/features/dashboard/types/weather";

import { DashboardWeatherCard } from "./DashboardWeatherCard";

const labels: DashboardWeatherLabels = {
  eyebrow: "Weather",
  title: "At the cottage",
  locationLabel: "Šumava",
  feelsLike: "Feels like",
  precipitation: "Precipitation",
  wind: "Wind",
  updated: "Updated",
  unavailableTitle: "Weather unavailable",
  unavailableDescription: "Try again later.",
};

const conditionLabels = Object.fromEntries(
  WEATHER_CONDITION_KEYS.map((key) => [key, `condition:${key}`]),
) as DashboardWeatherConditionLabels;

const availableWeather: DashboardWeather = {
  status: "available",
  apparentTemperatureC: 9,
  observedAt: "2026-10-23T14:30",
  precipitationMm: 0.4,
  temperatureC: 12,
  weatherCode: 61,
  windSpeedKmh: 15,
};

function getDefinition(term: string) {
  return screen.getByText(term).nextElementSibling;
}

describe("DashboardWeatherCard", () => {
  it("renders the eyebrow, h2 title and location", () => {
    render(
      <DashboardWeatherCard
        labels={labels}
        conditionLabels={conditionLabels}
        weather={availableWeather}
      />,
    );

    expect(screen.getByText("Weather")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "At the cottage" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Šumava")).toBeInTheDocument();
  });

  it("shows temperature, condition and the weather details when available", () => {
    render(
      <DashboardWeatherCard
        labels={labels}
        conditionLabels={conditionLabels}
        weather={availableWeather}
      />,
    );

    expect(screen.getByText("°C").parentElement).toHaveTextContent("12°C");
    expect(screen.getByText("condition:rain")).toBeInTheDocument();

    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Feels like",
      "Precipitation",
      "Wind",
      "Updated",
    ]);
    expect(getDefinition("Feels like")).toHaveTextContent("9°C");
    expect(getDefinition("Precipitation")).toHaveTextContent("0.4 mm");
    expect(getDefinition("Wind")).toHaveTextContent("15 km/h");

    const observedAt = screen.getByText("14:30");
    expect(observedAt.tagName).toBe("TIME");
    expect(observedAt).toHaveAttribute("dateTime", "2026-10-23T14:30");

    expect(screen.queryByText("Weather unavailable")).not.toBeInTheDocument();
  });

  it("falls back to the unknown condition label for unmapped codes", () => {
    render(
      <DashboardWeatherCard
        labels={labels}
        conditionLabels={conditionLabels}
        weather={{ ...availableWeather, weatherCode: 1234 }}
      />,
    );

    expect(screen.getByText("condition:unknown")).toBeInTheDocument();
  });

  it("shows the unavailable state without any readings", () => {
    render(
      <DashboardWeatherCard
        labels={labels}
        conditionLabels={conditionLabels}
        weather={{ status: "unavailable" }}
      />,
    );

    expect(screen.getByText("Weather unavailable")).toBeInTheDocument();
    expect(screen.getByText("Try again later.")).toBeInTheDocument();
    expect(screen.queryByRole("term")).not.toBeInTheDocument();
    expect(screen.queryByText("°C")).not.toBeInTheDocument();
  });

  it.each([
    ["available", availableWeather],
    ["unavailable", { status: "unavailable" } as const],
  ])("renders no links when weather is %s", (_status, weather) => {
    render(
      <DashboardWeatherCard
        labels={labels}
        conditionLabels={conditionLabels}
        weather={weather}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
