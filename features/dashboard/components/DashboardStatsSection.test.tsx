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

async function renderStats() {
  render(
    await DashboardStatsSection({
      visitsPromise: Promise.resolve(visits),
      bulkPromise: Promise.resolve(bulk),
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
    ["visits", "/visits", "3", `${NS}.summary.visits {"count":1}`],
    ["tasks", "/tasks", "6", `${NS}.summary.tasks {"count":2}`],
    ["shopping", "/shopping", "4", `${NS}.summary.shopping {"count":4}`],
    ["notes", "/notes", "2", `${NS}.summary.notes`],
  ])(
    "renders the %s stat with its label, value and description",
    async (key, href, value, description) => {
      await renderStats();

      const link = screen.getByRole("link", {
        name: new RegExp(`^navigation\\.${key}\\b`),
      });
      expect(link).toHaveAttribute("href", href);
      expect(within(link).getByText(`navigation.${key}`)).toBeInTheDocument();
      expect(within(link).getByText(value)).toBeInTheDocument();
      expect(within(link).getByText(description)).toBeInTheDocument();
    },
  );

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
