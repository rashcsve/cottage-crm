import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

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

// DashboardPreviewCards is an async Server Component with its own test file.
vi.mock("@/features/dashboard/components/DashboardPreviewCards", () => ({
  DashboardPreviewCards: ({ locale }: { locale: string }) => (
    <div data-testid="preview-cards" data-locale={locale} />
  ),
}));

import type {
  DashboardBulkSectionData,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";
import type { Note } from "@/features/notes/types/notes";

import { DashboardStatsSection } from "./DashboardStatsSection";

const NS = "dashboard.overview";

const visits: DashboardVisitOverview = {
  currentVisits: [],
  nextVisit: null,
  currentCount: 1,
  upcomingCount: 3,
};

const note: Note = {
  id: 1,
  content: "Note",
  author: "Bob",
  authorId: "user-2",
  createdAt: "2026-10-19T18:00:00Z",
  photos: [],
};

const bulk: DashboardBulkSectionData = {
  tasks: { openCount: 6, overdueCount: 2, dueTodayCount: 1, priorityTasks: [] },
  shopping: { pendingCount: 4, purchasedCount: 1, pendingItems: [] },
  notes: { recentNotes: [note, { ...note, id: 2 }] },
};

async function renderStats(data: DashboardBulkSectionData = bulk) {
  render(
    await DashboardStatsSection({
      visitsPromise: Promise.resolve(visits),
      bulkPromise: Promise.resolve(data),
      locale: "en",
    }),
  );
}

describe("DashboardStatsSection", () => {
  it("renders a labelled summary section with four links in order", async () => {
    await renderStats();

    const summary = screen.getByRole("region", { name: `${NS}.summary.ariaLabel` });
    expect(
      within(summary)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/visits", "/tasks", "/shopping", "/notes"]);
  });

  it.each([
    ["upcomingVisits", "/visits", "3"],
    ["openTasks", "/tasks", "6"],
    ["suppliesToBuy", "/shopping", "4"],
    ["recentNotes", "/notes", "2"],
  ])(
    "renders the %s stat with its label and value",
    async (key, href, value) => {
      await renderStats();

      const label = `${NS}.summary.${key}`;
      const link = screen.getByRole("link", {
        name: new RegExp(`^${label.replaceAll(".", "\\.")}\\b`),
      });
      expect(link).toHaveAttribute("href", href);
      expect(within(link).getByText(label)).toBeInTheDocument();
      expect(within(link).getByText(value)).toBeInTheDocument();
    },
  );

  it("shows the overdue count under the to-dos stat only", async () => {
    await renderStats();

    const tasksLink = screen.getByRole("link", {
      name: new RegExp(`^${NS}\\.summary\\.openTasks\\b`),
    });
    expect(
      within(tasksLink).getByText(`${NS}.summary.overdue {"count":2}`),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/summary\.overdue/)).toHaveLength(1);
  });

  it("omits the overdue count when nothing is overdue", async () => {
    await renderStats({
      ...bulk,
      tasks: { ...bulk.tasks, overdueCount: 0 },
    });

    expect(screen.queryByText(/summary\.overdue/)).not.toBeInTheDocument();
  });

  it("renders the preview cards after the summary", async () => {
    await renderStats();

    const previews = screen.getByTestId("preview-cards");
    expect(previews).toHaveAttribute("data-locale", "en");

    const summary = screen.getByRole("region", { name: `${NS}.summary.ariaLabel` });
    expect(
      summary.compareDocumentPosition(previews) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
