"use server";

import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

import { redirect } from "@/i18n/navigation";
import { E2E_AUTH_COOKIE } from "@/lib/e2e/mock-auth";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import { createClient } from "@/lib/supabase/server";
import { publicRoutes } from "@/lib/routes";

export async function signOutAction() {
  const locale = await getLocale();

  if (isE2EMockModeEnabled()) {
    const cookieStore = await cookies();

    cookieStore.delete(E2E_AUTH_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect({ href: publicRoutes.login, locale });
}
