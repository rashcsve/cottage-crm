import { createClient } from "@/lib/supabase/server";
import { Profile, UserRole } from "@/lib/types/profile";
import { AuthError } from "@/lib/auth/errors";

export type UserContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  userRole: UserRole;
  displayName: string;
};

export async function requireUser(): Promise<UserContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("notAuthenticated");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    throw new AuthError("profileNotFound");
  }

  return {
    supabase,
    userId: user.id,
    userRole: profile.role,
    displayName: profile.display_name,
  };
}
