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
import csMessages from "@/i18n/locales/cs.json";
import { formatVisitCompactDateRangeLabel } from "@/features/visits/shared/formatVisitDate";
import type { Visit } from "@/features/visits/types/visits";

import { DashboardPresenceCard } from "./DashboardPresenceCard";
import { DashboardPresenceSection } from "./DashboardPresenceSection";

const LOCALE = "en";

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Alice",
    couple: "couple-1",
    coupleLabel: null,
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
    currentVisits: [],
    emptyDescription: "Empty description",
    emptyTitle: "Empty title",
    label: "At the cottage now",
    locale: LOCALE,
    nextVisit: null,
    nextVisitLabel: "Next visit",
    statement: "Nobody right now.",
    ...overrides,
  };

  return render(<DashboardPresenceCard {...props} />);
}

describe("DashboardPresenceCard", () => {
  it("renders the section label as the h2 and the statement below it", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { level: 2, name: "At the cottage now" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nobody right now.")).toBeInTheDocument();
  });

  it("shows the empty state when nobody is here and no visit is planned", () => {
    renderCard();

    expect(screen.getByText("Empty title")).toBeInTheDocument();
    expect(screen.getByText("Empty description")).toBeInTheDocument();
    expect(screen.queryByText("Next visit")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists current visitors with their date ranges under the statement", () => {
    renderCard({
      currentVisits: [currentAlice, currentBob],
      statement: "Here now: Alice and Bob.",
    });

    expect(screen.getByText("Here now: Alice and Bob.")).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(`Alice${rangeLabel(currentAlice)}`);
    expect(items[1]).toHaveTextContent(`Bob${rangeLabel(currentBob)}`);

    expect(screen.queryByText("Empty title")).not.toBeInTheDocument();
    expect(screen.queryByText("Next visit")).not.toBeInTheDocument();
  });

  it("shows the more-visitors line after the listed visitors", () => {
    renderCard({
      currentVisits: [currentAlice, currentBob],
      moreLabel: "+1 more",
    });

    const items = screen.getAllByRole("listitem");
    const more = screen.getByText("+1 more");
    expect(
      items[1].compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders no more-visitors line without a label", () => {
    renderCard({ currentVisits: [currentAlice, currentBob] });

    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("shows the next visit with its label, visitor and date range", () => {
    renderCard({ nextVisit: nextCarol });

    expect(screen.getByText("Next visit")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
    expect(screen.getByText(rangeLabel(nextCarol))).toBeInTheDocument();

    expect(screen.queryByText("Empty title")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("replaces a single stay's row with its dates and remaining time", () => {
    renderCard({
      currentVisits: [currentAlice],
      statement: "Here now: Alice.",
      stayRemaining: "2 more nights",
    });

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    const detail = screen.getByText("2 more nights").parentElement;
    expect(detail).toHaveTextContent(`${rangeLabel(currentAlice)}`);
    expect(screen.queryByText("Empty title")).not.toBeInTheDocument();
  });

  it("keeps the rows when several stays overlap, even with a remaining label", () => {
    renderCard({
      currentVisits: [currentAlice, currentBob],
      stayRemaining: "2 more nights",
    });

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("2 more nights")).not.toBeInTheDocument();
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

const TODAY = "2026-10-23";

async function renderSection(
  overview: DashboardVisitOverview,
  locale = LOCALE,
  todayIso = TODAY,
) {
  render(
    await DashboardPresenceSection({
      visitsPromise: Promise.resolve(overview),
      locale,
      todayIso,
    }),
  );
}

describe("DashboardPresenceSection", () => {
  it("labels the section with today's date", async () => {
    await renderSection(createOverview());

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: 'dashboard.overview.presence.labelWithDate {"date":"Friday, October 23"}',
      }),
    ).toBeInTheDocument();
  });

  it("uses the empty statement when nobody is here and no visit is planned", async () => {
    await renderSection(createOverview());

    expect(
      screen.getByText("dashboard.overview.presence.statementEmpty"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.noVisitTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.overview.presence.noVisitDescription"),
    ).toBeInTheDocument();
  });

  it("names everyone who is there as a locale-joined list", async () => {
    await renderSection(
      createOverview({
        currentVisits: [currentAlice, currentBob],
        currentCount: 2,
      }),
    );

    expect(
      screen.getByText(
        'dashboard.overview.presence.statementPresent {"names":"Alice and Bob"}',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText(/presence\.moreVisitors/)).not.toBeInTheDocument();
  });

  it("names all visitors but lists two rows and a more line when three are there", async () => {
    await renderSection(
      createOverview({
        currentVisits: [currentAlice, currentBob, { ...nextCarol, status: "current" }],
        currentCount: 3,
      }),
      "cs",
    );

    expect(
      screen.getByText(
        'dashboard.overview.presence.statementPresent {"names":"Alice, Bob a Carol"}',
      ),
    ).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Alice");
    expect(items[1]).toHaveTextContent("Bob");
    expect(
      screen.getByText('dashboard.overview.presence.moreVisitors {"count":1}'),
    ).toBeInTheDocument();
  });

  it("names a single visitor or group without a count", async () => {
    await renderSection(
      createOverview({ currentVisits: [currentAlice], currentCount: 1 }),
    );

    expect(
      screen.getByText(
        'dashboard.overview.presence.statementPresent {"names":"Alice"}',
      ),
    ).toBeInTheDocument();
  });

  it("tells a single stay how many nights are left instead of repeating its row", async () => {
    await renderSection(
      createOverview({ currentVisits: [currentAlice], currentCount: 1 }),
    );

    expect(
      screen.getByText('dashboard.overview.presence.nightsLeft {"count":2}'),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("says a single stay is leaving on its departure day", async () => {
    await renderSection(
      createOverview({ currentVisits: [currentAlice], currentCount: 1 }),
      LOCALE,
      "2026-10-25",
    );

    expect(
      screen.getByText("dashboard.overview.presence.leavingToday"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/nightsLeft/)).not.toBeInTheDocument();
  });

  it("shows the next arrival when nobody is here but a visit is planned", async () => {
    await renderSection(createOverview({ nextVisit: nextCarol, upcomingCount: 1 }));

    expect(
      screen.getByText("dashboard.overview.presence.statementEmpty"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'dashboard.overview.presence.nextVisitIn {"relative":"in 14 days"}',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("says tomorrow when the next arrival is the next day", async () => {
    await renderSection(
      createOverview({ nextVisit: nextCarol, upcomingCount: 1 }),
      LOCALE,
      "2026-11-05",
    );

    expect(
      screen.getByText(
        'dashboard.overview.presence.nextVisitIn {"relative":"tomorrow"}',
      ),
    ).toBeInTheDocument();
  });

  it("shows the next arrival alongside current visitors", async () => {
    await renderSection(
      createOverview({
        currentVisits: [currentAlice],
        currentCount: 1,
        nextVisit: nextCarol,
        upcomingCount: 1,
      }),
    );

    expect(
      screen.getByText('dashboard.overview.presence.statementPresent {"names":"Alice"}'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dashboard\.overview\.presence\.nextVisitIn/),
    ).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });
});

describe("presence copy in Czech", () => {
  async function createCsTranslator() {
    const { createTranslator } =
      await vi.importActual<typeof import("next-intl")>("next-intl");

    return createTranslator({
      locale: "cs",
      messages: csMessages,
      namespace: "dashboard.overview.presence",
    });
  }

  it.each([
    ["Anna a Tom", "Teď na chatě: Anna a Tom."],
    ["Alice, Bob a Carol", "Teď na chatě: Alice, Bob a Carol."],
  ])("states who is there without a count: %s", async (names, expected) => {
    const t = await createCsTranslator();

    expect(t("statementPresent", { names })).toBe(expected);
  });

  it.each([
    [1, "+1 další"],
    [3, "+3 další"],
    [5, "+5 dalších"],
  ])("pluralises the more-visitors line for %i", async (count, expected) => {
    const t = await createCsTranslator();

    expect(t("moreVisitors", { count })).toBe(expected);
  });

  it.each([
    [1, "ještě 1 noc"],
    [2, "ještě 2 noci"],
    [5, "ještě 5 nocí"],
  ])("pluralises the nights-left line for %i", async (count, expected) => {
    const t = await createCsTranslator();

    expect(t("nightsLeft", { count })).toBe(expected);
  });

  it("dates the label and says when the next arrival is", async () => {
    const t = await createCsTranslator();

    expect(t("labelWithDate", { date: "pátek 23. října" })).toBe(
      "pátek 23. října · na chatě",
    );
    expect(t("nextVisitIn", { relative: "za 6 dní" })).toBe(
      "Další příjezd · za 6 dní",
    );
  });
});
