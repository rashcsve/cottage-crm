import { describe, it, expect, vi, beforeEach } from "vitest";

import { publicRoutes } from "@/lib/routes";

const NEXT_REDIRECT = Symbol("NEXT_REDIRECT");

const {
  getLocaleMock,
  intlRedirectMock,
  cookiesMock,
  cookieDeleteMock,
  isE2EMockModeEnabledMock,
  signOutMock,
  createClientMock,
} = vi.hoisted(() => ({
  getLocaleMock: vi.fn(),
  intlRedirectMock: vi.fn(),
  cookiesMock: vi.fn(),
  cookieDeleteMock: vi.fn(),
  isE2EMockModeEnabledMock: vi.fn(),
  signOutMock: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getLocale: getLocaleMock,
}));
vi.mock("@/i18n/navigation", () => ({
  redirect: intlRedirectMock,
}));
vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));
vi.mock("@/lib/e2e/mock-mode", () => ({
  isE2EMockModeEnabled: isE2EMockModeEnabledMock,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { signOutAction } from "./sign-out";

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLocaleMock.mockResolvedValue("en");
    intlRedirectMock.mockImplementation(() => {
      throw NEXT_REDIRECT;
    });
    cookiesMock.mockResolvedValue({ delete: cookieDeleteMock });
    isE2EMockModeEnabledMock.mockReturnValue(false);
    createClientMock.mockResolvedValue({ auth: { signOut: signOutMock } });
  });

  it("signs out of the real Supabase session and redirects home", async () => {
    await expect(signOutAction()).rejects.toBe(NEXT_REDIRECT);

    expect(signOutMock).toHaveBeenCalled();
    expect(intlRedirectMock).toHaveBeenCalledWith({
      href: publicRoutes.home,
      locale: "en",
    });
  });

  it("clears the E2E auth cookie instead of calling Supabase in mock mode", async () => {
    isE2EMockModeEnabledMock.mockReturnValue(true);

    await expect(signOutAction()).rejects.toBe(NEXT_REDIRECT);

    expect(cookieDeleteMock).toHaveBeenCalledWith("codex-e2e-auth");
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
