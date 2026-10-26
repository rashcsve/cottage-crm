import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies, headers } from "next/headers";

import { E2E_AUTH_COOKIE, E2E_AUTH_COOKIE_VALUE } from "@/lib/e2e/mock-auth";
import { createClient } from "@/lib/supabase/server";

import { googleSignInAction } from "./actions";

vi.mock("next-intl/server", async () => {
  const { createTranslatorMock } =
    await import("@/tests/utils/create-translator-mock");

  return {
    getTranslations: vi.fn(async () => createTranslatorMock()),
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const ORIGIN = "http://localhost:3000";
const GOOGLE_URL = "https://accounts.google.test/o/oauth2/auth?state=abc";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type HeaderStore = Awaited<ReturnType<typeof headers>>;
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const cookieSet = vi.fn();
const signInWithOAuth = vi.fn();

function mockHeaders(origin: string | null) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => (name.toLowerCase() === "origin" ? origin : null),
  } as unknown as HeaderStore);
}

describe("googleSignInAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
    vi.stubEnv("E2E_MOCKS", "");

    vi.mocked(cookies).mockResolvedValue({
      set: cookieSet,
    } as unknown as CookieStore);
    mockHeaders(ORIGIN);
    vi.mocked(createClient).mockResolvedValue({
      auth: { signInWithOAuth },
    } as unknown as SupabaseClient);
    signInWithOAuth.mockResolvedValue({
      data: { provider: "google", url: GOOGLE_URL },
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("refuses in demo mode without touching Supabase or cookies", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");

    const result = await googleSignInAction("en");

    expect(result).toEqual({ ok: false, error: "errors.unexpected" });
    expect(createClient).not.toHaveBeenCalled();
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it.each([
    ["en", "/en/overview"],
    ["cs", "/overview"],
  ])(
    "in E2E mock mode sets the auth cookie and returns the %s dashboard path",
    async (locale, expectedUrl) => {
      vi.stubEnv("E2E_MOCKS", "1");

      const result = await googleSignInAction(locale);

      expect(result).toEqual({ ok: true, url: expectedUrl });
      expect(cookieSet).toHaveBeenCalledWith(
        E2E_AUTH_COOKIE,
        E2E_AUTH_COOKIE_VALUE,
        expect.objectContaining({ path: "/", sameSite: "lax" }),
      );
      expect(createClient).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["en", `${ORIGIN}/en/auth/callback`],
    ["cs", `${ORIGIN}/auth/callback`],
    ["de", `${ORIGIN}/auth/callback`],
  ])(
    "starts Google OAuth for locale %s with a localized callback and returns the provider URL",
    async (locale, expectedRedirectTo) => {
      const result = await googleSignInAction(locale);

      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: { redirectTo: expectedRedirectTo },
      });
      expect(result).toEqual({ ok: true, url: GOOGLE_URL });
      expect(cookieSet).not.toHaveBeenCalled();
    },
  );

  it("returns the localized unexpected error when Supabase returns an error", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { provider: "google", url: null },
      error: { code: "provider_disabled", message: "Provider disabled" },
    });

    const result = await googleSignInAction("en");

    expect(result).toEqual({ ok: false, error: "errors.unexpected" });
    expect(console.error).toHaveBeenCalled();
  });

  it("returns the localized unexpected error when Supabase returns no URL", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { provider: "google", url: null },
      error: null,
    });

    const result = await googleSignInAction("en");

    expect(result).toEqual({ ok: false, error: "errors.unexpected" });
  });

  it("refuses without calling Supabase when the Origin header is missing", async () => {
    mockHeaders(null);

    const result = await googleSignInAction("en");

    expect(result).toEqual({ ok: false, error: "errors.unexpected" });
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  it("returns the localized unexpected error when Supabase throws", async () => {
    signInWithOAuth.mockRejectedValue(new Error("network down"));

    const result = await googleSignInAction("en");

    expect(result).toEqual({ ok: false, error: "errors.unexpected" });
    expect(console.error).toHaveBeenCalled();
  });
});
