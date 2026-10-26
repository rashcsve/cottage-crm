import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { routing } from "./i18n/routing";
import { proxy } from "./proxy";

type CookieToSet = { name: string; value: string; options: object };
type CookieMethods = { setAll: (cookies: CookieToSet[]) => void };

const getUser = vi.fn();
let cookieMethods: CookieMethods | undefined;

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(
    (_url: string, _key: string, options: { cookies: CookieMethods }) => {
      cookieMethods = options.cookies;
      return { auth: { getUser } };
    },
  ),
}));

const ORIGIN = "http://localhost:3100";

function request(path: string, cookie?: string): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

function redirectPath(response: Response): string | null {
  const location = response.headers.get("location");
  return location ? new URL(location, ORIGIN).pathname : null;
}

function rewritePath(response: Response): string | null {
  const rewrite = response.headers.get("x-middleware-rewrite");
  return rewrite ? new URL(rewrite, ORIGIN).pathname : null;
}

describe("proxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    getUser.mockReset();
    cookieMethods = undefined;
  });

  it("treats cs as the unprefixed default locale", () => {
    expect(routing.defaultLocale).toBe("cs");
  });

  describe("in E2E mock mode", () => {
    beforeEach(() => {
      vi.stubEnv("E2E_MOCKS", "1");
    });

    describe("unauthenticated dashboard paths", () => {
      it.each([
        ["/en/overview", "/en/login"],
        ["/en/visits/123", "/en/login"],
        ["/overview", "/login"],
        ["/tasks/", "/login"],
        ["/cs/overview", "/login"],
        ["/cs/visits/123", "/login"],
        ["/cs/overview/", "/login"],
      ])("redirects %s to %s", async (path, loginPath) => {
        const response = await proxy(request(path));

        expect(response.status).toBe(307);
        expect(redirectPath(response)).toBe(loginPath);
      });

      it("redirects when the auth cookie is not active", async () => {
        const response = await proxy(
          request("/overview", "codex-e2e-auth=expired"),
        );

        expect(response.status).toBe(307);
        expect(redirectPath(response)).toBe("/login");
      });
    });

    describe("bare locale roots", () => {
      it.each(["/cs", "/cs/"])("redirects %s to /", async (path) => {
        const response = await proxy(request(path));

        expect(response.status).toBe(307);
        expect(redirectPath(response)).toBe("/");
      });

      it("serves /en without a redirect", async () => {
        const response = await proxy(request("/en"));

        expect(redirectPath(response)).toBeNull();
      });
    });

    describe("non-dashboard paths", () => {
      it("rewrites unprefixed /login to the cs locale", async () => {
        const response = await proxy(request("/login"));

        expect(redirectPath(response)).toBeNull();
        expect(rewritePath(response)).toBe("/cs/login");
      });

      it("serves /en/login without a redirect", async () => {
        const response = await proxy(request("/en/login"));

        expect(redirectPath(response)).toBeNull();
      });

      it("redirects /cs/login to the unprefixed /login", async () => {
        const response = await proxy(request("/cs/login"));

        expect(response.status).toBe(307);
        expect(redirectPath(response)).toBe("/login");
      });

      it("does not treat /overviewx as a dashboard path", async () => {
        const response = await proxy(request("/overviewx"));

        expect(redirectPath(response)).toBeNull();
        expect(rewritePath(response)).toBe("/cs/overviewx");
      });
    });

    describe("authenticated dashboard paths", () => {
      const cookie = "codex-e2e-auth=active";

      it("rewrites unprefixed /overview to the cs locale", async () => {
        const response = await proxy(request("/overview", cookie));

        expect(redirectPath(response)).toBeNull();
        expect(rewritePath(response)).toBe("/cs/overview");
      });

      it("serves /en/overview without a redirect", async () => {
        const response = await proxy(request("/en/overview", cookie));

        expect(redirectPath(response)).toBeNull();
      });

      it("redirects /cs/overview to the unprefixed /overview", async () => {
        const response = await proxy(request("/cs/overview", cookie));

        expect(response.status).toBe(307);
        expect(redirectPath(response)).toBe("/overview");
      });
    });
  });

  describe("with Supabase auth", () => {
    beforeEach(() => {
      vi.stubEnv("E2E_MOCKS", "");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.test");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    });

    it.each([
      ["/en/overview", "/en/login"],
      ["/overview", "/login"],
      ["/cs/overview", "/login"],
    ])("redirects unauthenticated %s to %s", async (path, loginPath) => {
      getUser.mockResolvedValue({ data: { user: null } });

      const response = await proxy(request(path));

      expect(response.status).toBe(307);
      expect(redirectPath(response)).toBe(loginPath);
    });

    describe("authenticated", () => {
      beforeEach(() => {
        getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
      });

      it("rewrites unprefixed /overview to the cs locale", async () => {
        const response = await proxy(request("/overview"));

        expect(redirectPath(response)).toBeNull();
        expect(rewritePath(response)).toBe("/cs/overview");
      });

      it("serves /en/overview without a redirect", async () => {
        const response = await proxy(request("/en/overview"));

        expect(redirectPath(response)).toBeNull();
      });

      it("carries refreshed session cookies onto the i18n response", async () => {
        getUser.mockImplementation(async () => {
          cookieMethods?.setAll([
            { name: "sb-session", value: "refreshed", options: { path: "/" } },
          ]);
          return { data: { user: { id: "user-1" } } };
        });

        const response = await proxy(request("/overview"));

        expect(redirectPath(response)).toBeNull();
        expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
      });
    });
  });
});
