import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";

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

vi.mock("@/shared/ui/MobileActionBar", () => ({
  MobileActionBar: ({ children }: { children: ReactNode }) => (
    <div data-testid="mobile-action-bar">{children}</div>
  ),
}));

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

  function getCtas() {
    const mobileCta = within(screen.getByTestId("mobile-action-bar")).getByRole(
      "link",
      { name: `${NS}.planVisit` },
    );
    const desktopCta = screen
      .getAllByRole("link", { name: `${NS}.planVisit` })
      .find((link) => link !== mobileCta);

    if (!desktopCta) {
      throw new Error("desktop plan-a-visit CTA not found");
    }

    return { desktopCta, mobileCta };
  }

  it("links both plan-a-visit CTAs to the calendar", async () => {
    await renderOverview();

    const ctas = screen.getAllByRole("link", { name: `${NS}.planVisit` });
    expect(ctas).toHaveLength(2);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/visits");
    }
  });

  it("pins the plan-a-visit CTA in the mobile action bar", async () => {
    await renderOverview();

    const { mobileCta } = getCtas();
    expect(mobileCta).toBeInTheDocument();
  });

  it("shows the in-column CTA from lg only", async () => {
    await renderOverview();

    const { desktopCta } = getCtas();
    expect(desktopCta.parentElement).toHaveClass("hidden", "lg:block");
  });

  it("puts presence, the desktop CTA and weather in one column and the previews in the other", async () => {
    await renderOverview();

    const presence = screen.getByTestId("presence");
    const { desktopCta, mobileCta } = getCtas();
    const weather = screen.getByTestId("weather");
    const previews = screen.getByTestId("previews");

    const leftColumn = presence.parentElement;
    expect(leftColumn).toContainElement(desktopCta);
    expect(leftColumn).toContainElement(weather);
    expect(leftColumn).not.toContainElement(previews);
    expect(leftColumn).not.toContainElement(mobileCta);
  });

  it("keeps the DOM order: presence, desktop CTA, weather, previews, then the mobile bar", async () => {
    await renderOverview();

    const presence = screen.getByTestId("presence");
    const { desktopCta, mobileCta } = getCtas();
    const weather = screen.getByTestId("weather");
    const previews = screen.getByTestId("previews");

    expect(follows(presence, desktopCta)).toBe(true);
    expect(follows(desktopCta, weather)).toBe(true);
    expect(follows(weather, previews)).toBe(true);
    expect(follows(previews, mobileCta)).toBe(true);
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
