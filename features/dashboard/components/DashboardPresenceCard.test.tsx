import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";

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

import type { DashboardVisitOverview } from "@/features/dashboard/types/dashboard";
import { formatVisitCompactDateRangeLabel } from "@/features/visits/shared/formatVisitDate";
import type { Visit } from "@/features/visits/types/visits";

import { DashboardPresenceCard } from "./DashboardPresenceCard";
import { DashboardPresenceSection } from "./DashboardPresenceSection";

const TODAY_ISO = "2026-10-23";
const LOCALE = "en";

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Alice",
    dateFrom: "2026-10-22",
    dateTo: "2026-10-25",
    status: "current",
    note: null,
    author: "Alice",
    authorId: "user-1",
    createdAt: "2026-10-01T10:00:00Z",
    ...overrides,
  };
}

const currentAlice = createVisit();
const currentBob = createVisit({
  id: 2,
  visitorName: "Bob",
  dateFrom: "2026-10-23",
  dateTo: "2026-10-24",
});
const nextCarol = createVisit({
  id: 3,
  visitorName: "Carol",
  dateFrom: "2026-11-06",
  dateTo: "2026-11-08",
  status: "upcoming",
});

function rangeLabel(visit: Visit) {
  return formatVisitCompactDateRangeLabel(visit.dateFrom, visit.dateTo, LOCALE);
}

type CardProps = ComponentProps<typeof DashboardPresenceCard>;

function renderCard(overrides: Partial<CardProps> = {}) {
  const props: CardProps = {
    badgeLabel: "Badge",
    currentVisits: [],
    description: "Description",
    emptyDescription: "Empty description",
    emptyTitle: "Empty title",
    locale: LOCALE,
    nextVisit: null,
    nextVisitLabel: "Next visit",
    title: "Presence title",
    todayIso: TODAY_ISO,
    tone: "neutral",
    ...overrides,
  };

  return render(<DashboardPresenceCard {...props} />);
}

describe("DashboardPresenceCard", () => {
  it("renders today's full date, the h2 title, description and badge", () => {
    renderCard();

    expect(screen.getByText("Friday, October 23, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Presence title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Badge")).toBeInTheDocument();
  });

  it("shows the empty state when nobody is here and no visit is planned", () => {
    renderCard();

    expect(screen.getByText("Empty title")).toBeInTheDocument();
    expect(screen.getByText("Empty description")).toBeInTheDocument();
    expect(screen.queryByText("Next visit")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists current visitors with their count and date ranges", () => {
    renderCard({ currentVisits: [currentAlice, currentBob] });

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Alice, Bob")).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(`Alice${rangeLabel(currentAlice)}`);
    expect(items[1]).toHaveTextContent(`Bob${rangeLabel(currentBob)}`);

    expect(screen.queryByText("Empty title")).not.toBeInTheDocument();
    expect(screen.queryByText("Next visit")).not.toBeInTheDocument();
  });

  it("shows the next visit with its label, visitor and date range", () => {
    renderCard({ nextVisit: nextCarol });

    expect(screen.getByText("Next visit")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
    expect(screen.getByText(rangeLabel(nextCarol))).toBeInTheDocument();

    expect(screen.queryByText("Empty title")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows current visitors and the next visit together", () => {
    renderCard({ currentVisits: [currentAlice], nextVisit: nextCarol });

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Next visit")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("renders no links", () => {
    renderCard({ currentVisits: [currentAlice], nextVisit: nextCarol });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

function createOverview(
  overrides: Partial<DashboardVisitOverview> = {},
): DashboardVisitOverview {
  return {
    currentVisits: [],
    nextVisit: null,
    currentCount: 0,
    upcomingCount: 0,
    ...overrides,
  };
}

async function renderSection(overview: DashboardVisitOverview) {
  render(
    await DashboardPresenceSection({
      visitsPromise: Promise.resolve(overview),
      todayIso: TODAY_ISO,
      locale: LOCALE,
    }),
  );
}

describe("DashboardPresenceSection", () => {
  it("uses the empty copy when nobody is here and no visit is planned", async () => {
    await renderSection(createOverview());

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "dashboard.overview.presence.emptyTitle",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.emptyDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.emptyBadge"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.noVisitTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.noVisitDescription"),
    ).toBeInTheDocument();
  });

  it("uses the current copy and count badge when someone is here", async () => {
    await renderSection(
      createOverview({
        currentVisits: [currentAlice, currentBob],
        currentCount: 2,
      }),
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "dashboard.overview.presence.currentTitle",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.currentDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getByText('dashboard.overview.presence.currentBadge {"count":2}'),
    ).toBeInTheDocument();
    expect(screen.getByText("Alice, Bob")).toBeInTheDocument();
  });

  it("uses the next-visit copy when nobody is here but a visit is planned", async () => {
    await renderSection(createOverview({ nextVisit: nextCarol, upcomingCount: 1 }));

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "dashboard.overview.presence.emptyTitle",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.nextDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.emptyBadge"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.nextVisitLabel"),
    ).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });
});
