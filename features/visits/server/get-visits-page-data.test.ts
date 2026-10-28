import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAllVisitsMock, getCouplesMock, getCurrentProfileMock, isDemoModeEnabledMock } =
  vi.hoisted(() => ({
    getAllVisitsMock: vi.fn(),
    getCouplesMock: vi.fn(),
    getCurrentProfileMock: vi.fn(),
    isDemoModeEnabledMock: vi.fn(),
  }));

vi.mock("./queries", () => ({
  getAllVisits: getAllVisitsMock,
  getCouples: getCouplesMock,
}));

vi.mock("@/lib/auth/get-current-profile", () => ({
  getCurrentProfile: getCurrentProfileMock,
}));

vi.mock("@/lib/demo/is-demo-mode", () => ({
  isDemoModeEnabled: isDemoModeEnabledMock,
}));

vi.mock("@/lib/e2e/mock-mode", () => ({
  isE2EMockModeEnabled: () => false,
}));

import { getVisitsPageData } from "./get-visits-page-data";

const COUPLES = [
  { id: "couple-1", label: "Jana a Petr" },
  { id: "couple-2", label: "Eva a Karel" },
  { id: "admin", label: "Admin" },
];

describe("getVisitsPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllVisitsMock.mockResolvedValue([]);
    getCouplesMock.mockResolvedValue(COUPLES);
    getCurrentProfileMock.mockResolvedValue({
      role: "admin",
      display_name: "Jana Admin",
      couple: "couple-1",
    });
  });

  it("leaves the admin couple out outside demo mode", async () => {
    isDemoModeEnabledMock.mockReturnValue(false);

    const { couples } = await getVisitsPageData();

    expect(couples.map((couple) => couple.id)).toEqual(["couple-1", "couple-2"]);
  });

  it("offers the admin couple in demo mode", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);

    const { couples } = await getVisitsPageData();

    expect(couples.map((couple) => couple.id)).toEqual(["couple-1", "couple-2", "admin"]);
  });
});
