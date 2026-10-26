import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const suspended = vi.hoisted(() => ({ presence: false, previews: false }));

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
    DashboardPresenceSection: ({ todayIso }: { todayIso: string }) => {
      if (suspended.presence) use(pending);
      return <div data-testid="presence" data-today={todayIso} />;
    },
  };
});

vi.mock("@/features/dashboard/components/DashboardPreviewSection", async () => {
  const { use } = await import("react");
  const pending = new Promise<never>(() => {});

  return {
    DashboardPreviewSection: () => {
      if (suspended.previews) use(pending);
      return <div data-testid="previews" />;
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
      todayIso: "2026-10-26",
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
    suspended.previews = false;
  });

  it("links the plan-a-visit CTA to the calendar", async () => {
    await renderOverview();

    expect(
      screen.getByRole("link", { name: `${NS}.planVisit` }),
    ).toHaveAttribute("href", "/visits");
  });

  it("puts presence, the CTA and weather in one column and the previews in the other", async () => {
    await renderOverview();

    const presence = screen.getByTestId("presence");
    const cta = screen.getByRole("link", { name: `${NS}.planVisit` });
    const weather = screen.getByTestId("weather");
    const previews = screen.getByTestId("previews");

    const leftColumn = presence.parentElement;
    expect(leftColumn).toContainElement(cta);
    expect(leftColumn).toContainElement(weather);
    expect(leftColumn).not.toContainElement(previews);
  });

  it("keeps the DOM order: presence, CTA, weather, then previews", async () => {
    await renderOverview();

    const presence = screen.getByTestId("presence");
    const cta = screen.getByRole("link", { name: `${NS}.planVisit` });
    const weather = screen.getByTestId("weather");
    const previews = screen.getByTestId("previews");

    expect(follows(presence, cta)).toBe(true);
    expect(follows(cta, weather)).toBe(true);
    expect(follows(weather, previews)).toBe(true);
  });

  // Weather has no focusable content, so moving it with CSS order on mobile
  // leaves the tab order unchanged; the classes are the behaviour under test.
  it("moves weather after the previews below lg only", async () => {
    await renderOverview();

    const weatherSlot = screen.getByTestId("weather").parentElement;
    expect(weatherSlot).toHaveClass("order-last", "lg:order-none");
    expect(weatherSlot?.parentElement).toHaveClass("contents", "lg:flex");
  });

  it("passes today's date to presence", async () => {
    await renderOverview();

    expect(screen.getByTestId("presence")).toHaveAttribute(
      "data-today",
      "2026-10-26",
    );
  });

  it("passes the locale to the weather card", async () => {
    await renderOverview();

    expect(screen.getByTestId("weather")).toHaveAttribute("data-locale", "en");
  });

  it("shows the previews while presence is still loading", async () => {
    suspended.presence = true;
    await renderOverview();

    expect(screen.queryByTestId("presence")).not.toBeInTheDocument();
    expect(screen.getByTestId("previews")).toBeInTheDocument();
    expect(screen.getByTestId("weather")).toBeInTheDocument();
  });

  it("shows presence while the previews are still loading", async () => {
    suspended.previews = true;
    await renderOverview();

    expect(screen.queryByTestId("previews")).not.toBeInTheDocument();
    expect(screen.getByTestId("presence")).toBeInTheDocument();
    expect(screen.getByTestId("weather")).toBeInTheDocument();
  });
});
