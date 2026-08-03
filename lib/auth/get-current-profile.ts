import { getLocale } from "next-intl/server";
import { redirect as redirectToUnlocalizedPath } from "next/navigation";

import { AuthError } from "@/lib/auth/errors";
import { getCurrentAuthState } from "@/lib/auth/get-current-auth-state";
import { getDemoSessionUrl } from "@/lib/demo/demo-session-url";
import { isDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import type { Profile } from "@/lib/types/profile";
import { redirect } from "@/i18n/navigation";
import { publicRoutes } from "@/lib/routes";

export async function getCurrentProfile(): Promise<Profile> {
  const { user, profile } = await getCurrentAuthState();

  if (!user) {
    const locale = await getLocale();

    if (isDemoModeEnabled()) {
      redirectToUnlocalizedPath(getDemoSessionUrl(locale));
    }

    redirect({ href: publicRoutes.login, locale });
  }

  if (!profile) {
    throw new AuthError("profileNotFound");
  }

  return profile;
}
