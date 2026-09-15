import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookiesMock,
  hasE2EAuthCookieMock,
  isE2EMockModeEnabledMock,
  createClientMock,
} = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  hasE2EAuthCookieMock: vi.fn(),
  isE2EMockModeEnabledMock: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/e2e/mock-auth", () => ({
  E2E_AUTH_COOKIE: "codex-e2e-auth",
  E2E_MOCK_PROFILE: {
    id: "e2e-user",
    display_name: "E2E Admin",
    role: "admin",
  },
  E2E_MOCK_USER: {
    id: "e2e-user",
    email: "e2e@example.com",
  },
  hasE2EAuthCookie: hasE2EAuthCookieMock,
}));

vi.mock("@/lib/e2e/mock-mode", () => ({
  isE2EMockModeEnabled: isE2EMockModeEnabledMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getCurrentAuthState } from "./get-current-auth-state";

describe("getCurrentAuthState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    isE2EMockModeEnabledMock.mockReturnValue(false);
  });

  it("returns the mock user and profile in E2E mode when the auth cookie is present", async () => {
    const supabase = {};

    isE2EMockModeEnabledMock.mockReturnValue(true);
    createClientMock.mockResolvedValue(supabase);
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "present" }),
    });
    hasE2EAuthCookieMock.mockReturnValue(true);

    await expect(getCurrentAuthState()).resolves.toEqual({
      supabase,
      user: {
        id: "e2e-user",
        email: "e2e@example.com",
      },
      profile: {
        id: "e2e-user",
        display_name: "E2E Admin",
        role: "admin",
      },
    });
  });

  it("returns null auth state when Supabase does not return a user", async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };

    createClientMock.mockResolvedValue(supabase);

    await expect(getCurrentAuthState()).resolves.toEqual({
      supabase,
      user: null,
      profile: null,
    });
  });

  it("retries the profile lookup for newly created users before succeeding", async () => {
    vi.useFakeTimers();

    const profile = {
      id: "user-1",
      display_name: "Ada",
      role: "viewer" as const,
    };
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: profile, error: null });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "ada@example.com" } },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: maybeSingleMock,
          })),
        })),
      })),
    };

    createClientMock.mockResolvedValue(supabase);

    const statePromise = getCurrentAuthState();
    await vi.runAllTimersAsync();

    await expect(statePromise).resolves.toEqual({
      supabase,
      user: { id: "user-1", email: "ada@example.com" },
      profile,
    });
    expect(maybeSingleMock).toHaveBeenCalledTimes(3);
  });

  it("returns a signed-in user without a profile when the row never appears", async () => {
    vi.useFakeTimers();

    const maybeSingleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "ada@example.com" } },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: maybeSingleMock,
          })),
        })),
      })),
    };

    createClientMock.mockResolvedValue(supabase);

    const statePromise = getCurrentAuthState();
    await vi.runAllTimersAsync();

    await expect(statePromise).resolves.toEqual({
      supabase,
      user: { id: "user-1", email: "ada@example.com" },
      profile: null,
    });
    expect(maybeSingleMock).toHaveBeenCalledTimes(3);
  });
});
