import "server-only";

import { getLocale } from "next-intl/server";
import { redirect as redirectToUnlocalizedPath } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import { getCurrentAuthState } from "@/lib/auth/get-current-auth-state";
import { getDemoSessionUrl } from "@/lib/demo/demo-session-url";
import { isDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

interface RedirectIfAuthenticatedOptions {
  skipDemoAutoLogin?: boolean;
}

export async function redirectIfAuthenticated(
  options: RedirectIfAuthenticatedOptions = {},
) {
  const { user } = await getCurrentAuthState();
  const locale = await getLocale();

  if (!user) {
    if (isDemoModeEnabled() && !options.skipDemoAutoLogin) {
      redirectToUnlocalizedPath(getDemoSessionUrl(locale));
    }
    return;
  }

  redirect({ href: DEFAULT_AUTHENTICATED_ROUTE, locale });
}
