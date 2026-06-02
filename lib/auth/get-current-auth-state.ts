import "server-only";

import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

import {
  E2E_AUTH_COOKIE_NAME,
  E2E_MOCK_PROFILE,
  E2E_MOCK_USER,
  hasE2EAuthCookie,
} from "@/lib/e2e/mock-auth";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";

interface CurrentAuthState {
  profile: Profile | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
}

export const getCurrentAuthState = cache(async (): Promise<CurrentAuthState> => {
  if (isE2EMockModeEnabled()) {
    const [cookieStore, supabase] = await Promise.all([cookies(), createClient()]);
    const isAuthenticated = hasE2EAuthCookie(
      cookieStore.get(E2E_AUTH_COOKIE_NAME)?.value,
    );

    return {
      supabase,
      user: isAuthenticated ? (E2E_MOCK_USER as User) : null,
      profile: isAuthenticated ? (E2E_MOCK_PROFILE as Profile) : null,
    };
  }

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
