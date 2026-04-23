"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicRoutes } from "@/lib/routes";

export async function signOutAction() {
  const supabase = await createClient();
  const locale = await getLocale();

  await supabase.auth.signOut();

  redirect({ href: publicRoutes.login, locale });
}
