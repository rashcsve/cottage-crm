import { Link } from "@/i18n/navigation";
import { getDemoCtaHref } from "@/lib/demo/demo-session-url";
import { MAIN_CONTENT_ID, publicRoutes, type PublicRoute } from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";
import { SkipToContentLink } from "@/shared/ui/SkipToContentLink";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { WordmarkLink } from "./WordmarkLink";

interface PublicShellProps {
  children: ReactNode;
  currentPath: PublicRoute;
  contentVariant?: "marketing" | "auth";
}

export async function PublicShell({
  children,
  currentPath,
  contentVariant = "auth",
}: PublicShellProps) {
  const [tNavigation, tPublicShell, tCommon, tAppShell, tDemo, locale] =
    await Promise.all([
      getTranslations("navigation"),
      getTranslations("publicShell"),
      getTranslations("common"),
      getTranslations("appShell"),
      getTranslations("demo"),
      getLocale(),
    ]);
  const demoHref = getDemoCtaHref(locale);
  const primaryAction =
    currentPath === publicRoutes.home
      ? {
          href: publicRoutes.login,
          label: tNavigation("login"),
          variant: "primary" as const,
        }
      : currentPath === publicRoutes.login
      ? {
          href: publicRoutes.signup,
          label: tNavigation("signup"),
          variant: "secondary" as const,
        }
      : {
          href: publicRoutes.login,
          label: tNavigation("login"),
          variant: "secondary" as const,
        };
  const secondaryAction =
    !demoHref && currentPath === publicRoutes.home
      ? {
          href: publicRoutes.signup,
          label: tNavigation("signup"),
        }
      : null;
  const headerStyle = {
    paddingTop: "var(--safe-area-top)",
  };
  const mainClassName =
    contentVariant === "marketing"
      ? "flex flex-1 items-start py-8 sm:py-10 lg:items-center lg:py-12"
      : "flex flex-1 items-start py-8 lg:py-16";

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink-primary">
      <SkipToContentLink
        label={tCommon("skipToContent")}
        targetId={MAIN_CONTENT_ID}
      />

      <header
        className="sticky top-0 z-30 border-b border-border bg-page"
        style={headerStyle}
      >
        <div className="mx-auto flex min-h-14 max-w-page items-center justify-between gap-4 px-5 lg:min-h-18 lg:px-10">
          <WordmarkLink href={publicRoutes.home} label={tAppShell("title")} />

          <nav
            aria-label={tPublicShell("navigationLabel")}
            className="flex shrink-0 items-center gap-2 lg:gap-3"
          >
            <LanguageSwitcher ariaLabel={tAppShell("languageSwitcherLabel")} />
            {secondaryAction ? (
              <div className="hidden sm:block">
                <Link
                  href={secondaryAction.href}
                  className={buttonVariants("secondary")}
                >
                  {secondaryAction.label}
                </Link>
              </div>
            ) : null}
            {demoHref ? (
              <a href={demoHref} className={buttonVariants("primary")}>
                {tDemo("tryButton")}
              </a>
            ) : (
              <Link
                href={primaryAction.href}
                aria-current={
                  currentPath === primaryAction.href ? "page" : undefined
                }
                className={buttonVariants(primaryAction.variant)}
              >
                {primaryAction.label}
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={`mx-auto w-full max-w-page px-5 lg:px-10 ${mainClassName}`}
      >
        {children}
      </main>
    </div>
  );
}
