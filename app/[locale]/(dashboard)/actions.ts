"use server";

import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

export async function signOutAction() {
  const supabase = await createClient();
  const locale = await getLocale();

  const { error } = await supabase.auth.signOut();

  if (error) throw new Error("Nepodařilo se odhlásit");

  redirect({ href: "/login", locale });
}
