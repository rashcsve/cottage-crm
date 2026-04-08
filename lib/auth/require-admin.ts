import { requireUser, UserContext } from "@/lib/auth/require-user";
import { AuthError } from "@/lib/auth/errors";

export type AdminContext = UserContext;

export async function requireAdmin(): Promise<AdminContext> {
  const context = await requireUser();

  if (context.userRole !== "admin") {
    throw new AuthError("forbidden");
  }

  return context;
}
