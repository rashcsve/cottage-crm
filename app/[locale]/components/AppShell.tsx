import { House } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense, type ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import {
  dashboardNavigationItems,
  DEFAULT_AUTHENTICATED_ROUTE,
  MAIN_CONTENT_ID,
} from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";
import { SkipToContentLink } from "@/shared/ui/SkipToContentLink";
import { Surface } from "@/shared/ui/Surface";

import { AppNav } from "./AppNav";
import { DesktopLogoutButton, MobileLogoutButton } from "./auth/LogoutButton";
import { ClientWeatherChip } from "./ClientWeatherChip";
import { ClientWeatherMobile } from "./ClientWeatherMobile";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppShellProps {
  children: ReactNode;
  userName?: string;
}

const DESKTOP_PANEL_CLASS =
  "border-nav-border bg-white/82 shadow-[0_18px_34px_-30px_rgba(24,24,27,0.38)]";
const DESKTOP_ACTION_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-muted focus-visible:ring-offset-2";
const MOBILE_ICON_BUTTON_CLASS = buttonVariants(
  "secondary",
  "min-h-10 min-w-10 rounded-xl border-nav-border px-0 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-nav-emphasis focus-visible:ring-nav-muted",
);

export async function AppShell({ children, userName }: AppShellProps) {
  const [tNavigation, tAppShell, tCommon] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("appShell"),
    getTranslations("common"),
  ]);

  const navigationItems = dashboardNavigationItems.map((item) => {
    const label = tNavigation(item.key);

    return {
      href: item.href,
      label,
      shortLabel: item.key === "shopping" ? tNavigation("shoppingShort") : label,
    };
  });

  const mobileHeaderStyle = {
    paddingTop: "calc(var(--safe-area-top) + 0.625rem)",
  };
  const mobileNavStyle = {
    paddingBottom: "calc(var(--safe-area-bottom) + 0.75rem)",
  };
  const trimmedUserName = userName?.trim();
  const accountName = trimmedUserName || tAppShell("accountFallbackName");
  const accountInitial = Array.from(accountName)[0]?.toLocaleUpperCase() ?? "?";
  const accountAriaLabel = trimmedUserName
    ? tAppShell("signOutAs", { name: accountName })
    : tNavigation("signOut");

  return (
    <div className="min-h-screen bg-page text-stone-800">
      <SkipToContentLink label={tCommon("skipToContent")} targetId={MAIN_CONTENT_ID} />

      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:flex lg:gap-5 lg:px-8">
        <aside className="hidden w-32 shrink-0 py-4 lg:block">
          <div className="sticky top-4 flex h-[calc(100svh-2rem)] flex-col items-center gap-4">
            <Surface className={`w-full p-2 ${DESKTOP_PANEL_CLASS}`}>
              <Link
                href={DEFAULT_AUTHENTICATED_ROUTE}
                className={`group flex w-full flex-col items-center gap-2 rounded-xl px-2 py-1.5 text-center transition hover:bg-nav-surface/80 ${DESKTOP_ACTION_CLASS}`}
                aria-label={tAppShell("title")}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-nav-ink text-white shadow-[0_16px_34px_-24px_rgba(24,24,27,0.7)] ring-1 ring-nav-ink/10 transition group-hover:-translate-y-0.5 group-hover:bg-zinc-800">
                  <House
                    className="h-5 w-5 transition group-hover:scale-105"
                    aria-hidden="true"
                  />
                </span>
                <span className="block max-w-full truncate text-[11px] font-bold leading-none text-nav-ink">
                  {tAppShell("title")}
                </span>
              </Link>
            </Surface>

            <Surface className="w-full border-nav-border bg-nav-surface/80 p-1.5 shadow-none">
              <AppNav
                items={navigationItems}
                ariaLabel={tAppShell("navigationLabel")}
              />
            </Surface>

            <div className="mt-auto w-full space-y-2 pt-2">
              <Surface
                className={`p-2 ${DESKTOP_PANEL_CLASS}`}
                role="group"
                aria-label={tAppShell("utilitiesLabel")}
              >
                <Suspense fallback={null}>
                  <ClientWeatherChip className="min-h-9 w-full justify-center px-2.5" />
                </Suspense>
                <div className="mt-1.5 flex justify-center">
                  <LanguageSwitcher
                    ariaLabel={tAppShell("languageSwitcherLabel")}
                    size="compact"
                  />
                </div>
              </Surface>

              <Surface className={`p-1.5 text-stone-800 ${DESKTOP_PANEL_CLASS}`}>
                <DesktopLogoutButton
                  accountInitial={accountInitial}
                  accountName={accountName}
                  signOutLabel={tNavigation("signOut")}
                  ariaLabel={accountAriaLabel}
                  buttonClass={`group flex w-full flex-col items-center gap-2 rounded-xl px-2 py-2.5 text-center transition hover:bg-nav-surface/80 disabled:cursor-not-allowed disabled:opacity-60 ${DESKTOP_ACTION_CLASS}`}
                />
              </Surface>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-6 lg:py-4 lg:pb-8">
          <header
            className="sticky top-0 z-30 -mx-4 mb-4 border-b border-stone-200/80 bg-stone-50/92 px-4 pb-2.5 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80 sm:-mx-6 sm:px-6 lg:hidden"
            style={mobileHeaderStyle}
          >
            <div className="flex items-center gap-3">
              <Link
                href={DEFAULT_AUTHENTICATED_ROUTE}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl ${DESKTOP_ACTION_CLASS}`}
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nav-ink text-white shadow-[0_14px_28px_-22px_rgba(24,24,27,0.7)] ring-1 ring-nav-ink/10">
                  <House className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {tAppShell("title")}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className="truncate">
                      {trimmedUserName ?? tAppShell("subtitle")}
                    </span>
                    <Suspense fallback={null}>
                      <ClientWeatherMobile />
                    </Suspense>
                  </p>
                </div>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <LanguageSwitcher
                  ariaLabel={tAppShell("languageSwitcherLabel")}
                  size="compact"
                  className="shrink-0"
                />
                <MobileLogoutButton
                  ariaLabel={tNavigation("signOut")}
                  buttonClass={MOBILE_ICON_BUTTON_CLASS}
                />
              </div>
            </div>
          </header>

          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="min-w-0 pb-28 lg:pb-0"
          >
            {children}
          </main>

          <div
            className="fixed inset-x-0 bottom-0 z-30 border-t border-nav-border bg-white/95 px-2 pt-1.5 shadow-[0_-14px_34px_-28px_rgba(24,24,27,0.25)] backdrop-blur lg:hidden"
            style={mobileNavStyle}
          >
            <div className="mx-auto max-w-lg">
              <AppNav
                items={navigationItems}
                ariaLabel={tAppShell("navigationLabel")}
                variant="mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
