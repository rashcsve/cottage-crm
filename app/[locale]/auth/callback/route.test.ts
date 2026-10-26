import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { exchangeCodeForSessionMock, createClientMock } = vi.hoisted(() => ({
  exchangeCodeForSessionMock: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET } from "./route";

function callCallback(url: string, locale: string) {
  return GET(new NextRequest(url), { params: Promise.resolve({ locale }) });
}

function getLocation(response: Response): URL {
  const location = response.headers.get("location");

  if (!location) {
    throw new Error("Expected a Location header");
  }

  return new URL(location);
}

describe("GET /[locale]/auth/callback", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
    });
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("exchanges the code and redirects to the cs dashboard", async () => {
    const response = await callCallback(
      "http://localhost/auth/callback?code=abc",
      "cs",
    );

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc");
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(getLocation(response).toString()).toBe("http://localhost/overview");
  });

  it("redirects to the en dashboard for the en locale", async () => {
    const response = await callCallback(
      "http://localhost/en/auth/callback?code=abc",
      "en",
    );

    expect(getLocation(response).toString()).toBe(
      "http://localhost/en/overview",
    );
  });

  it("redirects to the localized login error when the code is missing", async () => {
    const response = await callCallback(
      "http://localhost/en/auth/callback",
      "en",
    );

    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
    expect(getLocation(response).toString()).toBe(
      "http://localhost/en/login?error=oauth",
    );
  });

  it("redirects to the login error when the provider returns an error, even with a code", async () => {
    const response = await callCallback(
      "http://localhost/auth/callback?error=access_denied&code=abc",
      "cs",
    );

    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
    expect(getLocation(response).toString()).toBe(
      "http://localhost/login?error=oauth",
    );
  });

  it("redirects to the login error and logs when the exchange fails", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      error: { message: "invalid grant" },
    });

    const response = await callCallback(
      "http://localhost/auth/callback?code=abc",
      "cs",
    );

    expect(getLocation(response).toString()).toBe(
      "http://localhost/login?error=oauth",
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("redirects to the login error and logs when the exchange throws", async () => {
    exchangeCodeForSessionMock.mockRejectedValue(new Error("network"));

    const response = await callCallback(
      "http://localhost/en/auth/callback?code=abc",
      "en",
    );

    expect(getLocation(response).toString()).toBe(
      "http://localhost/en/login?error=oauth",
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("falls back to the default locale paths for an unknown locale", async () => {
    const response = await callCallback(
      "http://localhost/xx/auth/callback?code=abc",
      "xx",
    );

    expect(getLocation(response).toString()).toBe("http://localhost/overview");
  });

  it.each([
    ["success", "http://localhost/auth/callback?code=abc&next=https://evil.example"],
    ["missing code", "http://localhost/auth/callback?next=https://evil.example"],
    ["provider error", "http://localhost/auth/callback?error=x&next=//evil.example"],
  ])("never redirects off-origin (%s)", async (_label, url) => {
    const response = await callCallback(url, "cs");
    const location = getLocation(response);

    expect(location.origin).toBe("http://localhost");
    expect(location.toString()).not.toContain("evil.example");
  });
});
