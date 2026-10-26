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
  title: "Weather",
  locationLabel: "At the cottage",
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

function normalize(text: string | null | undefined) {
  return text?.replace(/−/g, "-").replace(/ /g, " ");
}

function renderCard(weather: DashboardWeather, locale = "en") {
  render(
    <DashboardWeatherCard
      labels={labels}
      conditionLabels={conditionLabels}
      locale={locale}
      weather={weather}
    />,
  );
}

describe("DashboardWeatherCard", () => {
  it("renders the h2 title and location", () => {
    renderCard(availableWeather);

    expect(
      screen.getByRole("heading", { level: 2, name: "Weather" }),
    ).toBeInTheDocument();
    expect(screen.getByText("At the cottage")).toBeInTheDocument();
  });

  it("shows the temperature, condition and three readings when available", () => {
    renderCard(availableWeather);

    expect(screen.getByText("12°C")).toBeInTheDocument();
    expect(screen.getByText("condition:rain")).toBeInTheDocument();

    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Wind",
      "Precipitation",
      "Feels like",
    ]);
    expect(getDefinition("Wind")).toHaveTextContent("15 km/h");
    expect(getDefinition("Precipitation")).toHaveTextContent("0.4 mm");
    expect(getDefinition("Feels like")).toHaveTextContent("9°C");

    expect(screen.queryByText("Weather unavailable")).not.toBeInTheDocument();
  });

  it("shows when the reading was last updated in the locale's clock", () => {
    renderCard(availableWeather);

    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    const observedAt = screen.getByText("2:30 PM");
    expect(observedAt.tagName).toBe("TIME");
    expect(observedAt).toHaveAttribute("dateTime", "2026-10-23T14:30");
  });

  it("shows the update time in the header, before the temperature", () => {
    renderCard(availableWeather);

    const observedAt = screen.getByText("2:30 PM");
    const temperature = screen.getByText("12°C");
    expect(
      observedAt.compareDocumentPosition(temperature) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("formats readings for the Czech locale", () => {
    renderCard(availableWeather, "cs");

    expect(screen.getByText("14:30")).toHaveAttribute("dateTime", "2026-10-23T14:30");

    expect(getDefinition("Precipitation")).toHaveTextContent("0,4 mm");
    expect(getDefinition("Feels like")).toHaveTextContent("9 °C");
  });

  it.each([
    ["en", "-3.5°C", "-1.2°C"],
    ["cs", "-3,5 °C", "-1,2 °C"],
  ])("formats negative and fractional temperatures for %s", (locale, temperature, feelsLike) => {
    renderCard(
      { ...availableWeather, temperatureC: -3.5, apparentTemperatureC: -1.2 },
      locale,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" && normalize(element.textContent) === temperature,
      ),
    ).toBeInTheDocument();
    expect(normalize(getDefinition("Feels like")?.textContent)).toBe(feelsLike);
  });

  it("falls back to the unknown condition label for unmapped codes", () => {
    renderCard({ ...availableWeather, weatherCode: 1234 });

    expect(screen.getByText("condition:unknown")).toBeInTheDocument();
  });

  it("shows the unavailable state without any readings", () => {
    renderCard({ status: "unavailable" });

    expect(screen.getByText("Weather unavailable")).toBeInTheDocument();
    expect(screen.getByText("Try again later.")).toBeInTheDocument();
    expect(screen.queryByRole("term")).not.toBeInTheDocument();
    expect(screen.queryByText(/°/)).not.toBeInTheDocument();
  });

  it.each([
    ["available", availableWeather],
    ["unavailable", { status: "unavailable" } as const],
  ])("renders no links when weather is %s", (_status, weather) => {
    renderCard(weather);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
