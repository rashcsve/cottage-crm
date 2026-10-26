import { getTranslations } from "next-intl/server";
import { Suspense, type ReactNode } from "react";

import {
  dashboardNavigationItems,
  DEFAULT_AUTHENTICATED_ROUTE,
  MAIN_CONTENT_ID,
} from "@/lib/routes";
import { SkipToContentLink } from "@/shared/ui/SkipToContentLink";

import { AppNav } from "./AppNav";
import { AccountMenu } from "./auth/AccountMenu";
import { ClientWeatherChip } from "./ClientWeatherChip";
import { DemoModeBanner } from "./DemoModeBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WordmarkLink } from "./WordmarkLink";

interface AppShellProps {
  children: ReactNode;
  userName?: string;
}

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

  const shellStyle = {
    paddingLeft: "var(--safe-area-left)",
    paddingRight: "var(--safe-area-right)",
  };
  const headerStyle = {
    paddingTop: "var(--safe-area-top)",
  };
  const mobileNavStyle = {
    ...shellStyle,
    paddingBottom: "var(--safe-area-bottom)",
  };
  const trimmedUserName = userName?.trim();
  const accountName = trimmedUserName || tAppShell("accountFallbackName");
  const accountInitial = Array.from(accountName)[0]?.toLocaleUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-page text-ink-primary" style={shellStyle}>
      <SkipToContentLink label={tCommon("skipToContent")} targetId={MAIN_CONTENT_ID} />
      <DemoModeBanner />

      <header
        className="sticky top-0 z-30 border-b border-border bg-page"
        style={headerStyle}
      >
        <div className="mx-auto flex h-14 max-w-page items-center gap-4 px-5 lg:h-18 lg:gap-10 lg:px-10">
          <WordmarkLink
            href={DEFAULT_AUTHENTICATED_ROUTE}
            label={tAppShell("title")}
          />

          <AppNav
            items={navigationItems}
            ariaLabel={tAppShell("navigationLabel")}
            className="hidden h-full min-w-0 flex-1 lg:block"
          />

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0 lg:gap-3">
            <Suspense fallback={null}>
              <ClientWeatherChip className="max-[359px]:hidden" />
            </Suspense>
            <LanguageSwitcher ariaLabel={tAppShell("languageSwitcherLabel")} />
            <AccountMenu
              accountName={accountName}
              accountInitial={accountInitial}
              triggerLabel={tAppShell("signedInAs", { name: accountName })}
              signOutLabel={tNavigation("signOut")}
            />
          </div>
        </div>
      </header>

      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="mx-auto min-w-0 max-w-page px-5 pt-4 pb-28 lg:px-10 lg:pt-6 lg:pb-12"
      >
        {children}
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden"
        style={mobileNavStyle}
      >
        <AppNav
          items={navigationItems}
          ariaLabel={tAppShell("navigationLabel")}
          variant="mobile"
          className="mx-auto max-w-lg"
        />
      </div>
    </div>
  );
}
