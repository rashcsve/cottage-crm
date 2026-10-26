import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// DashboardPreviewCards is an async Server Component with its own test file.
vi.mock("@/features/dashboard/components/DashboardPreviewCards", () => ({
  DashboardPreviewCards: ({
    data,
    locale,
  }: {
    data: { tasks: { openCount: number } };
    locale: string;
  }) => (
    <div
      data-testid="preview-cards"
      data-locale={locale}
      data-open-tasks={data.tasks.openCount}
    />
  ),
}));

import type { DashboardBulkSectionData } from "@/features/dashboard/types/dashboard";

import { DashboardPreviewSection } from "./DashboardPreviewSection";

const bulk: DashboardBulkSectionData = {
  tasks: { openCount: 6, overdueCount: 2, dueTodayCount: 1, priorityTasks: [] },
  shopping: { pendingCount: 4, purchasedCount: 1, pendingItems: [] },
  notes: { recentNotes: [] },
};

describe("DashboardPreviewSection", () => {
  it("renders the preview cards with the resolved bulk data and locale", async () => {
    render(
      await DashboardPreviewSection({
        bulkPromise: Promise.resolve(bulk),
        locale: "en",
      }),
    );

    const previews = screen.getByTestId("preview-cards");
    expect(previews).toHaveAttribute("data-locale", "en");
    expect(previews).toHaveAttribute("data-open-tasks", "6");
  });

  it("renders no summary strip", async () => {
    render(
      await DashboardPreviewSection({
        bulkPromise: Promise.resolve(bulk),
        locale: "en",
      }),
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/summary\./)).not.toBeInTheDocument();
  });
});
