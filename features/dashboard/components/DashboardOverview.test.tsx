import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const suspended = vi.hoisted(() => ({ presence: false, stats: false }));

vi.mock("next-intl/server", async () => {
  const { createNamespacedTranslatorMock } = await import(
    "@/tests/utils/create-server-translations-mock"
  );

  return {
    getTranslations: vi.fn(async (namespace: string) =>
      createNamespacedTranslatorMock(namespace),
    ),
  };
});

vi.mock("@/features/dashboard/components/DashboardPresenceSection", async () => {
  const { use } = await import("react");
  const pending = new Promise<never>(() => {});

  return {
    DashboardPresenceSection: () => {
      if (suspended.presence) use(pending);
      return <div data-testid="presence" />;
    },
  };
});

vi.mock("@/features/dashboard/components/DashboardStatsSection", async () => {
  const { use } = await import("react");
  const pending = new Promise<never>(() => {});

  return {
    DashboardStatsSection: () => {
      if (suspended.stats) use(pending);
      return <div data-testid="stats" />;
    },
  };
});

vi.mock("@/features/dashboard/components/ClientWeatherCard", () => ({
  ClientWeatherCard: ({ locale }: { locale: string }) => (
    <div data-testid="weather" data-locale={locale} />
  ),
}));

import type {
  DashboardBulkSectionData,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";

import { DashboardOverview } from "./DashboardOverview";

const NS = "dashboard.overview";

async function renderOverview() {
  render(
    await DashboardOverview({
      visitsPromise: new Promise<DashboardVisitOverview>(() => {}),
      bulkPromise: new Promise<DashboardBulkSectionData>(() => {}),
      locale: "en",
    }),
  );
}

function follows(earlier: Element, later: Element) {
  return Boolean(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

describe("DashboardOverview", () => {
  beforeEach(() => {
    suspended.presence = false;
    suspended.stats = false;
  });

  it("links the plan-a-visit CTA to the calendar", async () => {
    await renderOverview();

    expect(
      screen.getByRole("link", { name: `${NS}.planVisit` }),
    ).toHaveAttribute("href", "/visits");
  });

  it("puts presence, the CTA and weather in one column and the stats in the other", async () => {
    await renderOverview();

    const presence = screen.getByTestId("presence");
    const cta = screen.getByRole("link", { name: `${NS}.planVisit` });
    const weather = screen.getByTestId("weather");
    const stats = screen.getByTestId("stats");

    const leftColumn = presence.parentElement;
    expect(leftColumn).toContainElement(cta);
    expect(leftColumn).toContainElement(weather);
    expect(leftColumn).not.toContainElement(stats);
  });

  it("keeps the mobile reading order: presence, CTA, weather, then stats", async () => {
    await renderOverview();

    const presence = screen.getByTestId("presence");
    const cta = screen.getByRole("link", { name: `${NS}.planVisit` });
    const weather = screen.getByTestId("weather");
    const stats = screen.getByTestId("stats");

    expect(follows(presence, cta)).toBe(true);
    expect(follows(cta, weather)).toBe(true);
    expect(follows(weather, stats)).toBe(true);
  });

  it("passes the locale to the weather card", async () => {
    await renderOverview();

    expect(screen.getByTestId("weather")).toHaveAttribute("data-locale", "en");
  });

  it("shows the stats while presence is still loading", async () => {
    suspended.presence = true;
    await renderOverview();

    expect(screen.queryByTestId("presence")).not.toBeInTheDocument();
    expect(screen.getByTestId("stats")).toBeInTheDocument();
    expect(screen.getByTestId("weather")).toBeInTheDocument();
  });

  it("shows presence while the stats are still loading", async () => {
    suspended.stats = true;
    await renderOverview();

    expect(screen.queryByTestId("stats")).not.toBeInTheDocument();
    expect(screen.getByTestId("presence")).toBeInTheDocument();
    expect(screen.getByTestId("weather")).toBeInTheDocument();
  });
});
