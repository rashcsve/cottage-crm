import { AuthError } from "@/lib/auth/errors";
import { getCurrentAuthState } from "@/lib/auth/get-current-auth-state";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/profile";

export type UserContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  userRole: UserRole;
  displayName: string;
};

export async function requireUser(): Promise<UserContext> {
  const { supabase, user, profile } = await getCurrentAuthState();

  if (!user) {
    throw new AuthError("notAuthenticated");
  }

  if (!profile) {
    throw new AuthError("profileNotFound");
  }

  return {
    supabase,
    userId: user.id,
    userRole: profile.role,
    displayName: profile.display_name,
  };
}
