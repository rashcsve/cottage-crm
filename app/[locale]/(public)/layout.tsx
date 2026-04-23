import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import type { ReactNode } from "react";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  await redirectIfAuthenticated();
  return <>{children}</>;
}
