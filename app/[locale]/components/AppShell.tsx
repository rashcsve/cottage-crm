import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { signOutAction } from "@/lib/auth/sign-out";
import {
  dashboardNavigationItems,
  DEFAULT_AUTHENTICATED_ROUTE,
  MAIN_CONTENT_ID,
} from "@/lib/routes";
import type { UserRole } from "@/lib/types/profile";
import { SkipToContentLink } from "@/shared/ui/SkipToContentLink";

import { SidebarNav } from "./SidebarNav";

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
  const userInitials = getUserInitials(userName);
  const mobileHeaderStyle = {
    paddingTop: "calc(var(--safe-area-top) + 0.625rem)",
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
          className="sticky top-0 z-30 -mx-4 mb-4 border-b border-stone-200/80 bg-stone-50/92 px-4 pb-2.5 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80 md:hidden"
          style={mobileHeaderStyle}
        >
          <div className="flex items-center justify-between gap-3">
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

            <div className="flex shrink-0 items-center gap-2">
              {showAccountBlock && (
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-semibold tracking-[0.08em] text-stone-900 shadow-sm ring-1 ring-stone-200/80"
                  aria-label={userName ?? tAppShell("title")}
                >
                  {userInitials}
                </span>
              )}

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-stone-900"
                  aria-label={tNavigation("signOut")}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="flex gap-6 pb-6 md:gap-8 md:pt-4 md:pb-8">
          <aside className="hidden w-60 shrink-0 md:block lg:w-64">
            <div className="sticky top-5">
              <div className="px-2">
                <Link
                  href={DEFAULT_AUTHENTICATED_ROUTE}
                  className="flex items-center gap-3"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold tracking-tight text-white">
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
                  <div className="mt-5 rounded-[1.5rem] border border-stone-200/80 bg-white/88 px-4 py-3.5 shadow-[0_18px_44px_-34px_rgba(28,25,23,0.32)]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold tracking-[0.08em] text-white">
                        {userInitials}
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

                    <form action={signOutAction} className="mt-3">
                      <button
                        type="submit"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl text-sm font-medium text-stone-600 transition hover:text-stone-900"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>{tNavigation("signOut")}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-[1.75rem] border border-stone-200/80 bg-stone-100/85 p-2.5 backdrop-blur">
                <SidebarNav
                  items={navigationItems}
                  ariaLabel={tAppShell("navigationLabel")}
                />
              </div>
            </div>
          </aside>

          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="min-w-0 flex-1 pb-32 md:pt-1 md:pb-0"
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
