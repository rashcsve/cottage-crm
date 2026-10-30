import { afterEach, describe, expect, it, vi } from "vitest";

import OverviewPage from "./page";

const { connection, getCurrentProfile, startDashboardStreaming } = vi.hoisted(
  () => ({
    connection: vi.fn(async () => undefined),
    getCurrentProfile: vi.fn(),
    startDashboardStreaming: vi.fn(),
  }),
);

vi.mock("next/server", () => ({ connection }));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

vi.mock("@/app/[locale]/metadata", () => ({
  createPageMetadata: vi.fn(() => vi.fn()),
}));

vi.mock("@/lib/auth/get-current-profile", () => ({ getCurrentProfile }));

vi.mock("@/features/dashboard/server/get-dashboard-overview-data", () => ({
  startDashboardStreaming,
}));

vi.mock("@/features/dashboard/components/DashboardOverview", () => ({
  DashboardOverview: () => null,
}));

vi.mock("@/shared/ui/page/PageLayout", () => ({
  PageLayout: () => null,
}));

const params = Promise.resolve({ locale: "cs" });

describe("OverviewPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("checks the current user before starting the dashboard queries", async () => {
    getCurrentProfile.mockResolvedValue({ id: "user-1", role: "viewer" });
    startDashboardStreaming.mockReturnValue({
      visitsPromise: Promise.resolve(),
      bulkPromise: Promise.resolve(),
    });

    await OverviewPage({ params });

    expect(getCurrentProfile).toHaveBeenCalledTimes(1);
    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(
      getCurrentProfile.mock.invocationCallOrder[0],
    );
    expect(getCurrentProfile.mock.invocationCallOrder[0]).toBeLessThan(
      startDashboardStreaming.mock.invocationCallOrder[0],
    );
  });

  it("starts the dashboard queries with the Prague date just after midnight", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-14T23:30:00.000Z"));
    getCurrentProfile.mockResolvedValue({ id: "user-1", role: "viewer" });
    startDashboardStreaming.mockReturnValue({
      visitsPromise: Promise.resolve(),
      bulkPromise: Promise.resolve(),
    });

    try {
      await OverviewPage({ params });
    } finally {
      vi.useRealTimers();
    }

    expect(startDashboardStreaming).toHaveBeenCalledWith("2026-01-15");
  });

  it("does not start the dashboard queries when the session is rejected", async () => {
    const redirectError = new Error("NEXT_REDIRECT");
    getCurrentProfile.mockRejectedValue(redirectError);

    await expect(OverviewPage({ params })).rejects.toBe(redirectError);
    expect(startDashboardStreaming).not.toHaveBeenCalled();
  });
});
