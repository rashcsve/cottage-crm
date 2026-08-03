import { NextResponse, type NextRequest } from "next/server";

import { getPathname } from "@/i18n/navigation";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/locales";
import { isDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import { demoSessionRateLimiter } from "@/lib/demo/rate-limit";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!isDemoModeEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const fetchMode = request.headers.get("sec-fetch-mode");

  if (fetchMode && fetchMode !== "navigate") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (demoSessionRateLimiter.isRateLimited(clientKey)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429 },
    );
  }

  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;

  if (!email || !password) {
    console.error(
      "[demo-session] DEMO_USER_EMAIL/DEMO_USER_PASSWORD are not configured.",
    );
    return NextResponse.json(
      { ok: false, error: "Demo credentials are not configured." },
      { status: 500 },
    );
  }

  const requestedLocale = request.nextUrl.searchParams.get("locale");
  const locale =
    requestedLocale && isSupportedLocale(requestedLocale)
      ? requestedLocale
      : DEFAULT_LOCALE;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[demo-session] Sign-in failed:", error.message);
    return NextResponse.json(
      { ok: false, error: "Demo sign-in failed." },
      { status: 502 },
    );
  }

  const destination = getPathname({ href: DEFAULT_AUTHENTICATED_ROUTE, locale });

  return NextResponse.redirect(new URL(destination, request.url));
}
