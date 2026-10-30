import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";
import { getDemoSessionUrl } from "./lib/demo/demo-session-url";
import { isDemoModeEnabled } from "./lib/demo/is-demo-mode";
import { getSafeDashboardNextPath } from "./lib/demo/safe-next-path";

const handleI18nRouting = createMiddleware(routing);

// Keep these in sync with i18n/locales.ts and lib/routes.ts.
// They are duplicated here intentionally: proxy runs in the Edge runtime
// and should not import from server-only application modules (the Edge-safe
// lib/demo helpers it imports are the exception).
const SUPPORTED_LOCALES = ["cs", "en"] as const;
const DASHBOARD_PATHS = ["/overview", "/visits", "/shopping", "/tasks", "/notes"] as const;
const E2E_AUTH_COOKIE = "codex-e2e-auth";

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(segment: string): segment is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(segment);
}

function isDashboardPath(pathname: string): boolean {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;
  const parts = normalized.split("/").filter(Boolean);
  const base = isSupportedLocale(parts[0] ?? "")
    ? `/${parts.slice(1).join("/")}`
    : normalized;

  return (DASHBOARD_PATHS as readonly string[]).some(
    (p) => base === p || base.startsWith(`${p}/`),
  );
}

function buildLoginUrl(request: NextRequest): URL {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = parts[0] ?? "";
  const prefix =
    isSupportedLocale(locale) && locale !== routing.defaultLocale
      ? `/${locale}`
      : "";
  return new URL(`${prefix}/login`, request.url);
}

function buildDemoSessionUrl(request: NextRequest): URL {
  const { pathname, search } = request.nextUrl;
  const [first = ""] = pathname.split("/").filter(Boolean);
  const locale = isSupportedLocale(first) ? first : routing.defaultLocale;
  const next = getSafeDashboardNextPath(`${pathname}${search}`) ?? undefined;
  return new URL(getDemoSessionUrl(locale, next), request.url);
}

export async function proxy(request: NextRequest) {
  const isDashboard = isDashboardPath(request.nextUrl.pathname);

  // E2E tests bypass Supabase auth with a simple cookie.
  if (process.env.E2E_MOCKS === "1") {
    const isAuthenticated =
      request.cookies.get(E2E_AUTH_COOKIE)?.value === "active";
    if (isDashboard && !isAuthenticated) {
      return NextResponse.redirect(buildLoginUrl(request));
    }
    return handleI18nRouting(request);
  }

  // Use a mutable response so the Supabase client can write refreshed session
  // cookies back to the browser when the JWT is near expiry.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() refreshes the session cookies and verifies the JWT locally
  // against the project's asymmetric signing keys, without a network call.
  // A revoked token passes here until it expires; getCurrentAuthState() still
  // calls getUser() on the server, which rejects it before any data is returned.
  const { data } = await supabase.auth.getClaims();

  // Carry over any session cookies Supabase wrote into `response`, including
  // cleared ones after a failed refresh.
  if (isDashboard && !data?.claims) {
    const target = isDemoModeEnabled()
      ? buildDemoSessionUrl(request)
      : buildLoginUrl(request);
    return withSessionCookies(NextResponse.redirect(target), response);
  }

  return withSessionCookies(handleI18nRouting(request), response);
}

function withSessionCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...opts }) => {
    target.cookies.set(name, value, opts);
  });
  return target;
}

export const config = {
  // Run on all paths except Next.js internals, static files (incl. PWA
  // manifests and icons), and the E2E reset endpoint (which manages its own
  // guard via isE2EMockModeEnabled).
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.[a-z]+\\.webmanifest$|icons/|api/).*)",
  ],
};
