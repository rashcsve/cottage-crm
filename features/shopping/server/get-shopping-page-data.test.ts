import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAllShoppingItemsMock, getCurrentProfileMock } = vi.hoisted(() => ({
  getAllShoppingItemsMock: vi.fn(),
  getCurrentProfileMock: vi.fn(),
}));

vi.mock("./queries", () => ({
  getAllShoppingItems: getAllShoppingItemsMock,
}));

vi.mock("@/lib/auth/get-current-profile", () => ({
  getCurrentProfile: getCurrentProfileMock,
}));

vi.mock("@/lib/e2e/mock-mode", () => ({
  isE2EMockModeEnabled: () => false,
}));

import { getShoppingPageData } from "./get-shopping-page-data";

describe("getShoppingPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    getAllShoppingItemsMock.mockResolvedValue([]);
    getCurrentProfileMock.mockResolvedValue({
      role: "viewer",
      display_name: "Eva Viewer",
      couple: "couple-2",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today's Prague date for the added-today summary", async () => {
    vi.setSystemTime(new Date("2026-10-28T23:30:00.000Z"));

    const { todayIso } = await getShoppingPageData();

    expect(todayIso).toBe("2026-10-29");
  });
});
