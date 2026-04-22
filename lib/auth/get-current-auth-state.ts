import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";

interface CurrentAuthState {
  profile: Profile | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
}

export const getCurrentAuthState = cache(async (): Promise<CurrentAuthState> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .single<Profile>();

  return {
    supabase,
    user,
    profile: profileError ? null : profile,
  };
});
