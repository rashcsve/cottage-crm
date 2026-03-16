import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/globals.css";
import { AppShell } from "@/app/components/AppShell";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chata CRM",
  description: "Rodinná správa chaty",
};

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
