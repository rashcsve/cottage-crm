import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";

export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .single<Profile>();

  if (profileError || !profile) {
    throw new Error("Nepodařilo se načíst profil.");
  }

  return profile;
}
