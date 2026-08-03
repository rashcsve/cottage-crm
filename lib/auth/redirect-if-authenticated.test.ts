import { describe, it, expect, vi, beforeEach } from "vitest";

import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

const NEXT_REDIRECT = Symbol("NEXT_REDIRECT");

const {
  getCurrentAuthStateMock,
  getLocaleMock,
  intlRedirectMock,
  nextRedirectMock,
  isDemoModeEnabledMock,
  getDemoSessionUrlMock,
} = vi.hoisted(() => ({
  getCurrentAuthStateMock: vi.fn(),
  getLocaleMock: vi.fn(),
  intlRedirectMock: vi.fn(),
  nextRedirectMock: vi.fn(),
  isDemoModeEnabledMock: vi.fn(),
  getDemoSessionUrlMock: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-auth-state", () => ({
  getCurrentAuthState: getCurrentAuthStateMock,
}));
vi.mock("next-intl/server", () => ({
  getLocale: getLocaleMock,
}));
vi.mock("@/i18n/navigation", () => ({
  redirect: intlRedirectMock,
}));
vi.mock("next/navigation", () => ({
  redirect: nextRedirectMock,
}));
vi.mock("@/lib/demo/is-demo-mode", () => ({
  isDemoModeEnabled: isDemoModeEnabledMock,
}));
vi.mock("@/lib/demo/demo-session-url", () => ({
  getDemoSessionUrl: getDemoSessionUrlMock,
}));

import { redirectIfAuthenticated } from "./redirect-if-authenticated";

describe("redirectIfAuthenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLocaleMock.mockResolvedValue("en");
    intlRedirectMock.mockImplementation(() => {
      throw NEXT_REDIRECT;
    });
    nextRedirectMock.mockImplementation(() => {
      throw NEXT_REDIRECT;
    });
  });

  it("does nothing when unauthenticated and demo mode is off", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: null });
    isDemoModeEnabledMock.mockReturnValue(false);

    await expect(redirectIfAuthenticated()).resolves.toBeUndefined();

    expect(nextRedirectMock).not.toHaveBeenCalled();
    expect(intlRedirectMock).not.toHaveBeenCalled();
  });

  it("redirects to the demo session route when unauthenticated and demo mode is on", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: null });
    isDemoModeEnabledMock.mockReturnValue(true);
    getDemoSessionUrlMock.mockReturnValue("/api/demo/session?locale=en");

    await expect(redirectIfAuthenticated()).rejects.toBe(NEXT_REDIRECT);

    expect(getDemoSessionUrlMock).toHaveBeenCalledWith("en");
    expect(nextRedirectMock).toHaveBeenCalledWith("/api/demo/session?locale=en");
    expect(intlRedirectMock).not.toHaveBeenCalled();
  });

  it("does not redirect to the demo session route when skipDemoAutoLogin is set", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: null });
    isDemoModeEnabledMock.mockReturnValue(true);

    await expect(
      redirectIfAuthenticated({ skipDemoAutoLogin: true }),
    ).resolves.toBeUndefined();

    expect(getDemoSessionUrlMock).not.toHaveBeenCalled();
    expect(nextRedirectMock).not.toHaveBeenCalled();
    expect(intlRedirectMock).not.toHaveBeenCalled();
  });

  it("redirects authenticated users to the dashboard regardless of demo mode", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: { id: "1" } });
    isDemoModeEnabledMock.mockReturnValue(true);

    await expect(redirectIfAuthenticated()).rejects.toBe(NEXT_REDIRECT);

    expect(intlRedirectMock).toHaveBeenCalledWith({
      href: DEFAULT_AUTHENTICATED_ROUTE,
      locale: "en",
    });
    expect(nextRedirectMock).not.toHaveBeenCalled();
  });
});
