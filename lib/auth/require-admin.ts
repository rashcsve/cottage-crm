import { createClient } from "@/../lib/supabase/server";
import { Profile } from "@/../lib/types/profile";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  displayName: string;
};

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Nejsi přihlášený/á.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    throw new Error("Profil nebyl nalezen.");
  }

  if (profile.role !== "admin") throw new Error("Nemáš oprávnění k této akci.");

  return { supabase, userId: user.id, displayName: profile.display_name };
}
