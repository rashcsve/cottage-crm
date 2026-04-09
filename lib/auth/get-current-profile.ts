import { getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";
import { redirect } from "@/i18n/navigation";

export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const userId = user?.id;

  if (userError || !userId) {
    const locale = await getLocale();

    redirect({ href: "/login", locale });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", userId)
    .single<Profile>();

  if (profileError || !profile) {
    throw new Error("Nepodařilo se načíst profil.");
  }

  return profile;
}
