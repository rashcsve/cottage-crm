import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const {
  isDemoModeEnabledMock,
  getPathnameMock,
  signInWithPasswordMock,
  createClientMock,
  isRateLimitedMock,
} = vi.hoisted(() => ({
  isDemoModeEnabledMock: vi.fn(),
  getPathnameMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
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

describe("GET /api/demo/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    createClientMock.mockResolvedValue({
      auth: { signInWithPassword: signInWithPasswordMock },
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

  it("signs in with the configured demo account and redirects to the localized dashboard", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getPathnameMock.mockReturnValue("/en/overview");

    const response = await GET(
      new NextRequest("http://localhost/api/demo/session?locale=en"),
    );

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "admin@cottage.demo",
      password: "secret",
    });
    expect(getPathnameMock).toHaveBeenCalledWith({
      href: expect.any(String),
      locale: "en",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/overview");
  });

  it("redirects to a safe dashboard next path after sign-in", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getPathnameMock.mockReturnValue("/en/overview");

    const next = encodeURIComponent("/en/visits?view=week&date=2026-11-02");
    const response = await GET(
      new NextRequest(`http://localhost/api/demo/session?locale=en&next=${next}`),
    );

    expect(signInWithPasswordMock).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/en/visits?view=week&date=2026-11-02",
    );
  });

  it("keeps the locale of next when it differs from the locale param", async () => {
    isDemoModeEnabledMock.mockReturnValue(true);
    process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
    process.env.DEMO_USER_PASSWORD = "secret";
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getPathnameMock.mockReturnValue("/overview");

    const response = await GET(
      new NextRequest(
        `http://localhost/api/demo/session?locale=cs&next=${encodeURIComponent("/en/visits")}`,
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/en/visits");
  });

  it.each([
    ["empty", ""],
    ["an external URL", "https://evil.com"],
    ["a protocol-relative URL", "//evil.com"],
    ["a non-dashboard path", "/login"],
  ])(
    "falls back to the localized dashboard when next is %s",
    async (_label, rawNext) => {
      isDemoModeEnabledMock.mockReturnValue(true);
      process.env.DEMO_USER_EMAIL = "admin@cottage.demo";
      process.env.DEMO_USER_PASSWORD = "secret";
      signInWithPasswordMock.mockResolvedValue({ error: null });
      getPathnameMock.mockReturnValue("/en/overview");

      const response = await GET(
        new NextRequest(
          `http://localhost/api/demo/session?locale=en&next=${encodeURIComponent(rawNext)}`,
        ),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost/en/overview");
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
    getPathnameMock.mockReturnValue("/overview");

    await GET(new NextRequest("http://localhost/api/demo/session?locale=xx"));

    expect(getPathnameMock).toHaveBeenCalledWith({
      href: expect.any(String),
      locale: "cs",
    });
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
});
