import { AppShell } from "@/app/components/AppShell";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <AppShell
      title="Dashboard"
      userName={profile.display_name}
      userRole={profile.role}
    >
      {children}
    </AppShell>
  );
}
