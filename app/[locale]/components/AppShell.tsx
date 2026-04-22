import { LogOut } from "lucide-react";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import type { UserRole } from "@/lib/types/profile";
import {
  dashboardNavigationItems,
  DEFAULT_AUTHENTICATED_ROUTE,
  MAIN_CONTENT_ID,
} from "@/lib/routes";
import { signOutAction } from "@/lib/auth/sign-out";
import { Surface } from "@/shared/ui/Surface";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";
import { Link } from "@/i18n/navigation";
import { SkipToContentLink } from "@/shared/ui/SkipToContentLink";

interface AppShellProps {
  children: ReactNode;
  userName?: string;
  userRole?: UserRole;
}

function getUserInitials(userName?: string) {
  if (!userName) {
    return "CC";
  }

  return userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function AppShell({
  children,
  userName,
  userRole,
}: AppShellProps) {
  const [tNavigation, tAppShell, tCommon] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("appShell"),
    getTranslations("common"),
  ]);

  const navigationItems = dashboardNavigationItems.map((item) => ({
    href: item.href,
    label: tNavigation(item.key),
  }));

  const showAccountBlock = Boolean(userName || userRole);
  const userMeta = userRole && isAdminRole(userRole) ? tAppShell("admin") : null;
  const mobileHeaderStyle = {
    paddingTop: "calc(var(--safe-area-top) + 0.75rem)",
  };
  const mobileNavStyle = {
    paddingBottom: "calc(var(--safe-area-bottom) + 0.75rem)",
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <SkipToContentLink
        label={tCommon("skipToContent")}
        targetId={MAIN_CONTENT_ID}
      />

      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
        <header
          className="sticky top-0 z-30 -mx-4 mb-5 border-b border-stone-200/80 bg-stone-50/92 px-4 pb-3 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80 md:hidden"
          style={mobileHeaderStyle}
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              href={DEFAULT_AUTHENTICATED_ROUTE}
              className="min-w-0 flex flex-1 items-center gap-3"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold tracking-tight text-white shadow-sm">
                CC
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {tAppShell("title")}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {tAppShell("subtitle")}
                </p>
              </div>
            </Link>

            <form action={signOutAction} className="shrink-0">
              <button
                type="submit"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-stone-900"
                aria-label={tNavigation("signOut")}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          {showAccountBlock && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-stone-200/80">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold tracking-[0.08em] text-white">
                {getUserInitials(userName)}
              </span>
              <div className="min-w-0">
                {userName && (
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {userName}
                  </p>
                )}
                <p className="truncate text-xs text-stone-500">
                  {userMeta ?? tAppShell("subtitle")}
                </p>
              </div>
            </div>
          )}
        </header>

        <div className="flex gap-6 pb-6 md:gap-8 md:py-6">
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="sticky top-6">
              <Surface className="rounded-[2rem] border-stone-200/80 bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(28,25,23,0.42)] backdrop-blur">
                <Link
                  href={DEFAULT_AUTHENTICATED_ROUTE}
                  className="flex items-center gap-3"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold tracking-tight text-white">
                    CC
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-stone-900">
                      {tAppShell("title")}
                    </p>
                    <p className="truncate text-sm text-stone-500">
                      {tAppShell("subtitle")}
                    </p>
                  </div>
                </Link>

                {showAccountBlock && (
                  <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-4 ring-1 ring-stone-200/80">
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold tracking-[0.08em] text-white">
                        {getUserInitials(userName)}
                      </span>
                      <div className="min-w-0">
                        {userName && (
                          <p className="truncate text-sm font-semibold text-stone-900">
                            {userName}
                          </p>
                        )}
                        <p className="truncate text-xs text-stone-500">
                          {userMeta ?? tAppShell("subtitle")}
                        </p>
                      </div>
                    </div>

                    <form action={signOutAction} className="shrink-0">
                      <button
                        type="submit"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>{tNavigation("signOut")}</span>
                      </button>
                    </form>
                  </div>
                )}

                <SidebarNav
                  items={navigationItems}
                  ariaLabel={tAppShell("navigationLabel")}
                  className="mt-5"
                />
              </Surface>
            </div>
          </aside>

          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="min-w-0 flex-1 pb-32 md:pb-0"
          >
            {children}
          </main>
        </div>

        <div
          className="fixed inset-x-0 bottom-0 z-30 px-4 md:hidden"
          style={mobileNavStyle}
        >
          <div className="mx-auto max-w-lg rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-1.5 shadow-[0_-18px_40px_-24px_rgba(28,25,23,0.45)] backdrop-blur">
            <SidebarNav
              items={navigationItems}
              ariaLabel={tAppShell("navigationLabel")}
              variant="mobile"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
