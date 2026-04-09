import { signOutAction } from "@/app/[locale]/(dashboard)/actions";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import type { UserRole } from "@/lib/types/profile";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  userName?: string;
  userRole?: UserRole;
}

export async function AppShell({
  children,
  title,
  userName,
  userRole,
}: AppShellProps) {
  const [tNavigation, tAppShell] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("appShell"),
  ]);

  const navigationItems = [
    { href: "/", label: tNavigation("home") },
    { href: "/visits", label: tNavigation("visits") },
    { href: "/shopping", label: tNavigation("shopping") },
    { href: "/tasks", label: tNavigation("tasks") },
    { href: "/notes", label: tNavigation("notes") },
  ];
  const showAccountBlock = Boolean(userName || userRole);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 md:hidden">
          <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                {tAppShell("title")}
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                {tAppShell("subtitle")}
              </p>
            </div>

            {showAccountBlock && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-3">
                <div className="min-w-0">
                  {userName && (
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {userName}
                    </p>
                  )}

                  {userRole && isAdminRole(userRole) && (
                    <p className="mt-1 text-xs text-stone-500">
                      {tAppShell("admin")}
                    </p>
                  )}
                </div>

                <form action={signOutAction} className="shrink-0">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:text-stone-900"
                  >
                    {tNavigation("signOut")}
                  </button>
                </form>
              </div>
            )}

            <SidebarNav
              items={navigationItems}
              ariaLabel={tAppShell("navigationLabel")}
              variant="mobile"
              className="mt-4"
            />
          </div>
        </div>

        <div className="flex gap-8 lg:gap-10">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-6">
              <h1 className="text-2xl font-bold tracking-tight">
                {tAppShell("title")}
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                {tAppShell("subtitle")}
              </p>

              {showAccountBlock && (
                <div className="mt-4 border-l-2 border-stone-300 pl-3">
                  {userName && (
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {userName}
                    </p>
                  )}

                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                    {userRole && isAdminRole(userRole) && (
                      <>
                        <span>{tAppShell("admin")}</span>
                        <span className="text-stone-300">•</span>
                      </>
                    )}

                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="cursor-pointer font-medium text-stone-500 transition hover:text-stone-800"
                      >
                        {tNavigation("signOut")}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <SidebarNav
                items={navigationItems}
                ariaLabel={tAppShell("navigationLabel")}
              />
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
    </div>
  );
}
