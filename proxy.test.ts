import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { routing } from "./i18n/routing";
import { config, proxy } from "./proxy";

type CookieToSet = { name: string; value: string; options: object };
type CookieMethods = { setAll: (cookies: CookieToSet[]) => void };

const getClaims = vi.fn();
const getUser = vi.fn();
let cookieMethods: CookieMethods | undefined;

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(
    (_url: string, _key: string, options: { cookies: CookieMethods }) => {
      cookieMethods = options.cookies;
      return { auth: { getClaims, getUser } };
    },
  ),
}));

const SIGNED_IN = { data: { claims: { sub: "user-1" } }, error: null };
const SIGNED_OUT = { data: null, error: null };

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
    getClaims.mockReset();
    getUser.mockReset();
    cookieMethods = undefined;
  });

  it("treats cs as the unprefixed default locale", () => {
    expect(routing.defaultLocale).toBe("cs");
  });

  describe("matcher", () => {
    function matches(path: string): boolean {
      return unstable_doesMiddlewareMatch({ config, url: path });
    }

    it.each([
      "/manifest.cs.webmanifest",
      "/manifest.en.webmanifest",
      "/icons/icon-192.png",
      "/icons/",
    ])("skips static PWA file %s", (path) => {
      expect(matches(path)).toBe(false);
    });

    it.each([
      "/_next/static/chunks/main.js",
      "/_next/image",
      "/favicon.ico",
      "/api/demo/session",
    ])("skips existing exclusion %s", (path) => {
      expect(matches(path)).toBe(false);
    });

    it.each([
      "/",
      "/login",
      "/en/login",
      "/overview",
      "/en/overview",
      "/icons",
      "/manifest.cs.webmanifestx",
      "/manifest.en.webmanifest/extra",
    ])(
      "still runs on page path %s",
      (path) => {
        expect(matches(path)).toBe(true);
      },
    );
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
      getClaims.mockResolvedValue(SIGNED_OUT);

      const response = await proxy(request(path));

      expect(response.status).toBe(307);
      expect(redirectPath(response)).toBe(loginPath);
    });

    it("redirects to login when the JWT fails verification", async () => {
      getClaims.mockResolvedValue({
        data: null,
        error: new Error("Invalid JWT signature"),
      });

      const response = await proxy(request("/overview"));

      expect(response.status).toBe(307);
      expect(redirectPath(response)).toBe("/login");
    });

    it("carries cleared session cookies onto the login redirect", async () => {
      getClaims.mockImplementation(async () => {
        cookieMethods?.setAll([
          { name: "sb-session", value: "", options: { path: "/" } },
        ]);
        return { data: null, error: new Error("Invalid Refresh Token") };
      });

      const response = await proxy(request("/overview", "sb-session=stale"));

      expect(redirectPath(response)).toBe("/login");
      expect(response.cookies.get("sb-session")?.value).toBe("");
    });

    it("redirects to login when getClaims returns no claims", async () => {
      getClaims.mockResolvedValue({ data: { claims: undefined }, error: null });

      const response = await proxy(request("/overview"));

      expect(response.status).toBe(307);
      expect(redirectPath(response)).toBe("/login");
    });

    it.each(["/", "/login"])(
      "does not redirect %s when the JWT fails verification and still carries refreshed cookies",
      async (path) => {
        getClaims.mockImplementation(async () => {
          cookieMethods?.setAll([
            { name: "sb-session", value: "", options: { path: "/" } },
          ]);
          return { data: null, error: new Error("Invalid JWT signature") };
        });

        const response = await proxy(request(path));

        expect(redirectPath(response)).toBeNull();
        expect(response.cookies.get("sb-session")).toBeDefined();
      },
    );

    it.each(["/overview", "/"])(
      "verifies the session locally on %s without calling getUser",
      async (path) => {
        getClaims.mockResolvedValue(SIGNED_IN);

        await proxy(request(path));

        expect(getClaims).toHaveBeenCalledTimes(1);
        expect(getUser).not.toHaveBeenCalled();
      },
    );

    describe("authenticated", () => {
      beforeEach(() => {
        getClaims.mockResolvedValue(SIGNED_IN);
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
        getClaims.mockImplementation(async () => {
          cookieMethods?.setAll([
            { name: "sb-session", value: "refreshed", options: { path: "/" } },
          ]);
          return SIGNED_IN;
        });

        const response = await proxy(request("/overview"));

        expect(redirectPath(response)).toBeNull();
        expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
      });
    });

    describe("non-dashboard paths", () => {
      function refreshSession(result: typeof SIGNED_IN | typeof SIGNED_OUT) {
        getClaims.mockImplementation(async () => {
          cookieMethods?.setAll([
            { name: "sb-session", value: "refreshed", options: { path: "/" } },
          ]);
          return result;
        });
      }

      it.each(["/", "/login", "/en/login"])(
        "does not redirect unauthenticated %s to login",
        async (path) => {
          getClaims.mockResolvedValue(SIGNED_OUT);

          const response = await proxy(request(path));

          expect(redirectPath(response)).toBeNull();
        },
      );

      it.each(["/", "/en"])(
        "carries refreshed session cookies onto the %s response",
        async (path) => {
          refreshSession(SIGNED_IN);

          const response = await proxy(request(path));

          expect(redirectPath(response)).toBeNull();
          expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
        },
      );

      it("forwards refreshed session cookies to the rendered page", async () => {
        refreshSession(SIGNED_IN);

        const response = await proxy(request("/", "sb-session=stale"));

        expect(response.headers.get("x-middleware-request-cookie")).toContain(
          "sb-session=refreshed",
        );
      });

      it("carries refreshed session cookies onto locale redirects", async () => {
        refreshSession(SIGNED_IN);

        const response = await proxy(request("/cs/login"));

        expect(redirectPath(response)).toBe("/login");
        expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
      });
    });
  });

  it("does not call Supabase in E2E mock mode", async () => {
    vi.stubEnv("E2E_MOCKS", "1");

    await proxy(request("/"));
    await proxy(request("/overview", "codex-e2e-auth=active"));

    expect(getClaims).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });
});
