"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicRoutes } from "@/lib/routes";

export async function signOutAction() {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Failed to sign out.");
  }

  redirect({ href: publicRoutes.login, locale });
}
