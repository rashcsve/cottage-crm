import { NextResponse, type NextRequest } from "next/server";

import {
  buildLoginErrorPath,
  buildPostLoginPath,
} from "@/app/[locale]/components/auth/build-auth-redirect-url";
import { isDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const providerError = searchParams.get("error");
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, origin));

  if (isDemoModeEnabled() || isE2EMockModeEnabled()) {
    return redirectTo(buildLoginErrorPath(locale));
  }

  if (providerError || !code) {
    console.error("[oauth-callback] Missing code or provider error:", providerError);
    return redirectTo(buildLoginErrorPath(locale));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[oauth-callback] Code exchange failed:", error);
      return redirectTo(buildLoginErrorPath(locale));
    }

    return redirectTo(buildPostLoginPath(locale));
  } catch (error) {
    console.error("[oauth-callback] Unexpected code exchange error:", error);
    return redirectTo(buildLoginErrorPath(locale));
  }
}
