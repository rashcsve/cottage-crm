import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const {
  isDemoModeEnabledMock,
  getPathnameMock,
  signInWithPasswordMock,
  getClaimsMock,
  createClientMock,
  isRateLimitedMock,
} = vi.hoisted(() => ({
  isDemoModeEnabledMock: vi.fn(),
  getPathnameMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  getClaimsMock: vi.fn(),
  createClientMock: vi.fn(),
  isRateLimitedMock: vi.fn(),
}));

vi.mock("@/lib/demo/is-demo-mode", () => ({
  isDemoModeEnabled: isDemoModeEnabledMock,
}));
vi.mock("@/i18n/navigation", () => ({
  getPathname: getPathnameMock,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));
vi.mock("@/lib/demo/rate-limit", () => ({
  demoSessionRateLimiter: { isRateLimited: isRateLimitedMock },
}));

import { GET } from "./route";

const ORIGINAL_ENV = { ...process.env };

function requestWithHeaders(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { headers });
}

function locationOf(response: Response) {
  const location = response.headers.get("location");

  if (location === null) {
    throw new Error("Expected a redirect location.");
  }

  return new URL(location);
}

function localizedPathname({ href, locale }: { href: string; locale: string }) {
  return locale === "cs" ? href : `/${locale}${href}`;
}

function verifyUrl(params: Record<string, string>) {
  const search = new URLSearchParams({ step: "verify", ...params });

  return `http://localhost/api/demo/session?${search.toString()}`;
}

describe("GET /api/demo/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
        getClaims: getClaimsMock,
      },
    });
    isRateLimitedMock.mockReturnValue(false);
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("returns 404 when demo mode is disabled", async () => {
    isDemoModeEnabledMock.mockReturnValue(false);

    const response = await GET(new NextRequest("http://localhost/api/demo/session"));

    expect(response.status).toBe(404);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns 400 when Sec-Fetch-Mode indicates a non-navigation request", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);

    const response = await GET(
      requestWithHeaders("http://localhost/api/demo/session", {
        "sec-fetch-mode": "no-cors",
      }),
    );

    expect(response.status).toBe(400);
    expect(isRateLimitedMock).not.toHaveBeenCalled();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("proceeds when Sec-Fetch-Mode is a real navigation", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getPathnameMock.mockReturnValue("/overview");

    const response = await GET(
      requestWithHeaders("http://localhost/api/demo/session", {
        "sec-fetch-mode": "navigate",
      }),
    );

    expect(response.status).toBe(307);
  });

  it("proceeds when the Sec-Fetch-Mode header is absent (older clients)", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getPathnameMock.mockReturnValue("/overview");

    const response = await GET(new NextRequest("http://localhost/api/demo/session"));

    expect(response.status).toBe(307);
  });

  it("returns 429 and skips sign-in when the client is rate limited", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    isRateLimitedMock.mockReturnValue(true);

    const response = await GET(new NextRequest("http://localhost/api/demo/session"));

    expect(response.status).toBe(429);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("keys the rate limiter by the first x-forwarded-for address", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getPathnameMock.mockReturnValue("/overview");

    await GET(
      requestWithHeaders("http://localhost/api/demo/session", {
        "x-forwarded-for": "203.0.113.5, 10.0.0.1",
      }),
    );

    expect(isRateLimitedMock).toHaveBeenCalledWith("203.0.113.5");
  });

  it("returns 500 when demo credentials are not configured", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    delete process.env.DEMO_USER_EMAIL;
    delete process.env.DEMO_USER_PASSWORD;

    const response = await GET(new NextRequest("http://localhost/api/demo/session"));

    expect(response.status).toBe(500);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("signs in with the configured demo account and redirects to the verify step", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });

    const response = await GET(
      new NextRequest("http://localhost/api/demo/session?locale=en"),
    );

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "admin@cottage.demo",
      password: "secret",
    });
    expect(response.status).toBe(307);
    const location = locationOf(response);
    expect(location.origin).toBe("http://localhost");
    expect(location.pathname).toBe("/api/demo/session");
    expect(location.searchParams.get("step")).toBe("verify");
    expect(location.searchParams.get("locale")).toBe("en");
    expect(location.searchParams.has("next")).toBe(false);
  });

  it("carries a safe next path to the verify step instead of redirecting to it", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });

    const next = encodeURIComponent("/en/visits?view=week&date=2026-11-02");
    const response = await GET(
      new NextRequest(`http://localhost/api/demo/session?locale=en&next=${next}`),
    );

    expect(response.status).toBe(307);
    const location = locationOf(response);
    expect(location.pathname).toBe("/api/demo/session");
    expect(location.searchParams.get("step")).toBe("verify");
    expect(location.searchParams.get("locale")).toBe("en");
    expect(location.searchParams.get("next")).toBe(
      "/en/visits?view=week&date=2026-11-02",
    );
  });

  it.each([
    ["empty", ""],
    ["an external URL", "https://evil.com"],
    ["a protocol-relative URL", "//evil.com"],
    ["a non-dashboard path", "/login"],
  ])(
    "drops next from the verify step when it is %s",
    async (_label, rawNext) => {
      isDemoModeEnabledMock.mockReturnValue(true);
      process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
      process.env.DEMO_USER_PASSWORD = "secret";
      signInWithPasswordMock.mockResolvedValue({ error: null });

      const response = await GET(
        new NextRequest(
          `http://localhost/api/demo/session?locale=en&next=${encodeURIComponent(rawNext)}`,
        ),
      );

      expect(response.status).toBe(307);
      const location = locationOf(response);
      expect(location.searchParams.get("step")).toBe("verify");
      expect(location.searchParams.has("next")).toBe(false);
    },
  );

  it.each([
    [
      "404 when demo mode is disabled",
      () => isDemoModeEnabledMock.mockReturnValue(false),
      {},
      404,
    ],
    [
      "400 for a non-navigation request",
      () => isDemoModeEnabledMock.mockReturnValue(true),
      { "sec-fetch-mode": "cors" },
      400,
    ],
    [
      "429 when rate limited",
      () => {
        isDemoModeEnabledMock.mockReturnValue(true);
        isRateLimitedMock.mockReturnValue(true);
      },
      {},
      429,
    ],
    [
      "500 when credentials are missing",
      () => {
        isDemoModeEnabledMock.mockReturnValue(true);
        delete process.env.DEMO_USER_EMAIL;
        delete process.env.DEMO_USER_PASSWORD;
      },
      {},
      500,
    ],
  ])(
    "still returns %s even with a valid next",
    async (_label, arrange, headers: Record<string, string>, status) => {
      arrange();

      const response = await GET(
        requestWithHeaders(
          `http://localhost/api/demo/session?next=${encodeURIComponent("/visits")}`,
          headers,
        ),
      );

      expect(response.status).toBe(status);
      expect(response.headers.get("location")).toBeNull();
      expect(signInWithPasswordMock).not.toHaveBeenCalled();
    },
  );

  it("falls back to the default locale for an unsupported locale param", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });

    const response = await GET(
      new NextRequest("http://localhost/api/demo/session?locale=xx"),
    );

    expect(locationOf(response).searchParams.get("locale")).toBe("cs");
  });

  it("returns 502 without redirecting when sign-in fails (avoids a redirect loop)", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "wrong";
    signInWithPasswordMock.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    const response = await GET(new NextRequest("http://localhost/api/demo/session"));

    expect(response.status).toBe(502);
    expect(getPathnameMock).not.toHaveBeenCalled();
  });

  describe("step=verify", () => {
    beforeEach(() => {
      isDemoModeEnabledMock.mockReturnValue(true);
      getPathnameMock.mockImplementation(localizedPathname);
    });

    it("redirects to a safe next path when the session cookie is present", async () => {
      getClaimsMock.mockResolvedValue({ data: { claims: { sub: "demo" } }, error: null });

      const response = await GET(
        new NextRequest(
          verifyUrl({ locale: "en", next: "/en/visits?view=week&date=2026-11-02" }),
        ),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost/en/visits?view=week&date=2026-11-02",
      );
    });

    it("keeps the locale of next when it differs from the locale param", async () => {
      getClaimsMock.mockResolvedValue({ data: { claims: { sub: "demo" } }, error: null });

      const response = await GET(
        new NextRequest(verifyUrl({ locale: "cs", next: "/en/visits" })),
      );

      expect(response.headers.get("location")).toBe("http://localhost/en/visits");
    });

    it.each([
      ["missing", undefined],
      ["an external URL", "https://evil.com"],
      ["a protocol-relative URL", "//evil.com"],
      ["a non-dashboard path", "/login"],
    ])(
      "falls back to the localized dashboard when next is %s",
      async (_label, rawNext) => {
        getClaimsMock.mockResolvedValue({ data: { claims: { sub: "demo" } }, error: null });

        const params: Record<string, string> = { locale: "en" };
        if (rawNext !== undefined) params.next = rawNext;
        const response = await GET(new NextRequest(verifyUrl(params)));

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("http://localhost/en/overview");
      },
    );

    it.each([
      ["no claims", { data: { claims: null }, error: null }],
      ["a claims error", { data: null, error: { message: "Auth session missing" } }],
    ])(
      "redirects to the localized login cookie error when there is %s",
      async (_label, claimsResult) => {
        getClaimsMock.mockResolvedValue(claimsResult);

        const response = await GET(
          new NextRequest(verifyUrl({ locale: "en", next: "/en/visits" })),
        );

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(
          "http://localhost/en/login?error=cookies",
        );
      },
    );

    it("uses the default-locale login path for the default locale", async () => {
      getClaimsMock.mockResolvedValue({ data: { claims: null }, error: null });

      const response = await GET(new NextRequest(verifyUrl({ locale: "cs" })));

      expect(response.headers.get("location")).toBe(
        "http://localhost/login?error=cookies",
      );
    });

    it("falls back to the default-locale login path for an unsupported locale param", async () => {
      getClaimsMock.mockResolvedValue({ data: { claims: null }, error: null });

      const response = await GET(new NextRequest(verifyUrl({ locale: "xx" })));

      expect(response.headers.get("location")).toBe(
        "http://localhost/login?error=cookies",
      );
    });

    it("never signs in or touches the rate limiter", async () => {
      process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
      process.env.DEMO_USER_PASSWORD = "secret";
      isRateLimitedMock.mockReturnValue(true);
      getClaimsMock.mockResolvedValue({ data: { claims: null }, error: null });

      const response = await GET(new NextRequest(verifyUrl({ locale: "en" })));

      expect(response.status).toBe(307);
      expect(signInWithPasswordMock).not.toHaveBeenCalled();
      expect(isRateLimitedMock).not.toHaveBeenCalled();
    });

    it("still returns 404 when demo mode is disabled", async () => {
      isDemoModeEnabledMock.mockReturnValue(false);

      const response = await GET(new NextRequest(verifyUrl({ locale: "en" })));

      expect(response.status).toBe(404);
      expect(createClientMock).not.toHaveBeenCalled();
    });

    it("still returns 400 for a non-navigation request", async () => {
      const response = await GET(
        requestWithHeaders(verifyUrl({ locale: "en" }), { "sec-fetch-mode": "cors" }),
      );

      expect(response.status).toBe(400);
      expect(createClientMock).not.toHaveBeenCalled();
    });
  });
});
