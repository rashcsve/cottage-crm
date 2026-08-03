import { describe, it, expect, vi, beforeEach } from "vitest";

import { publicRoutes } from "@/lib/routes";
import { AuthError } from "@/lib/auth/errors";

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

import { getCurrentProfile } from "./get-current-profile";

describe("getCurrentProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLocaleMock.mockResolvedValue("cs");
    intlRedirectMock.mockImplementation(() => {
      throw NEXT_REDIRECT;
    });
    nextRedirectMock.mockImplementation(() => {
      throw NEXT_REDIRECT;
    });
  });

  it("redirects to the demo session route when unauthenticated and demo mode is on", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: null, profile: null });
    isDemoModeEnabledMock.mockReturnValue(true);
    getDemoSessionUrlMock.mockReturnValue("/api/demo/session?locale=cs");

    await expect(getCurrentProfile()).rejects.toBe(NEXT_REDIRECT);

    expect(getDemoSessionUrlMock).toHaveBeenCalledWith("cs");
    expect(nextRedirectMock).toHaveBeenCalledWith("/api/demo/session?locale=cs");
    expect(intlRedirectMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when unauthenticated and demo mode is off", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: null, profile: null });
    isDemoModeEnabledMock.mockReturnValue(false);

    await expect(getCurrentProfile()).rejects.toBe(NEXT_REDIRECT);

    expect(intlRedirectMock).toHaveBeenCalledWith({
      href: publicRoutes.login,
      locale: "cs",
    });
    expect(nextRedirectMock).not.toHaveBeenCalled();
  });

  it("throws profileNotFound when authenticated but the profile row is missing", async () => {
    getCurrentAuthStateMock.mockResolvedValue({ user: { id: "1" }, profile: null });
    isDemoModeEnabledMock.mockReturnValue(false);

    await expect(getCurrentProfile()).rejects.toBeInstanceOf(AuthError);
  });

  it("returns the profile when authenticated", async () => {
    const profile = { id: "1", display_name: "Ada", role: "admin" as const };
    getCurrentAuthStateMock.mockResolvedValue({ user: { id: "1" }, profile });
    isDemoModeEnabledMock.mockReturnValue(false);

    await expect(getCurrentProfile()).resolves.toBe(profile);
  });
});
