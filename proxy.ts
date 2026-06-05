import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Keep these in sync with i18n/locales.ts and lib/routes.ts.
// They are duplicated here intentionally: proxy runs in the Edge runtime
// and should not import from server-only application modules.
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
  const prefix = isSupportedLocale(parts[0] ?? "") ? `/${parts[0]}` : "";
  return new URL(`${prefix}/login`, request.url);
}

export async function proxy(request: NextRequest) {
  // Non-dashboard paths (home, login, signup, etc.): locale routing only.
  if (!isDashboardPath(request.nextUrl.pathname)) {
    return handleI18nRouting(request);
  }

  // E2E tests bypass Supabase auth with a simple cookie.
  if (process.env.E2E_MOCKS === "1") {
    const isAuthenticated =
      request.cookies.get(E2E_AUTH_COOKIE)?.value === "active";
    if (!isAuthenticated) {
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

  // getUser() performs a network round-trip to Supabase Auth servers to verify
  // the JWT signature. This is intentional: it catches revoked tokens that
  // still have a valid expiry date.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(buildLoginUrl(request));
  }

  // Auth passed: run locale routing and carry over any refreshed session cookies
  // that Supabase wrote into `response`.
  const i18nResponse = handleI18nRouting(request);
  response.cookies.getAll().forEach(({ name, value, ...opts }) => {
    i18nResponse.cookies.set(name, value, opts);
  });

  return i18nResponse;
}

export const config = {
  // Run on all paths except Next.js internals, static files, and the E2E reset
  // endpoint (which manages its own guard via isE2EMockModeEnabled).
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)" ],
};
