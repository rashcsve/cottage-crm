import "server-only";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getCurrentAuthState } from "@/lib/auth/get-current-auth-state";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

export async function redirectIfAuthenticated() {
  const { user } = await getCurrentAuthState();

  if (!user) {
    return;
  }

  const locale = await getLocale();

  redirect({ href: DEFAULT_AUTHENTICATED_ROUTE, locale });
}
