import { signOutAction } from "@/app/(dashboard)/actions";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import type { UserRole } from "@/lib/types/profile";
import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  userName?: string;
  userRole?: UserRole;
}

const navigationItems = [
  { href: "/", label: "Domů" },
  { href: "/visits", label: "Návštěvy" },
  { href: "/shopping", label: "Nákupní seznam" },
  { href: "/tasks", label: "Úkoly" },
  { href: "/notes", label: "Poznámky" },
];

export function AppShell({
  children,
  title,
  userName,
  userRole,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto flex max-w-[1440px] gap-8 px-4 py-6 sm:px-6 lg:gap-10 lg:px-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6">
            <h1 className="text-2xl font-bold tracking-tight">Chata CRM</h1>
            <p className="mt-2 text-sm text-stone-600">Rodinný přehled chaty</p>

            <div className="mt-4 border-l-2 border-stone-300 pl-3">
              {userName && (
                <p className="truncate text-sm font-semibold text-stone-900">
                  {userName}
                </p>
              )}

              <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                {userRole && isAdminRole(userRole) && (
                  <>
                    <span>Správce</span>
                    <span className="text-stone-300">•</span>
                  </>
                )}

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="cursor-pointer font-medium text-stone-500 transition hover:text-stone-800"
                  >
                    Odhlásit se
                  </button>
                </form>
              </div>
            </div>

            <SidebarNav items={navigationItems} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="space-y-6">
            {title && (
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                {title}
              </h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
