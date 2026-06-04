import { Link } from "@/i18n/navigation";
import {
  MAIN_CONTENT_ID,
  publicRoutes,
  type PublicRoute,
} from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";
import { SkipToContentLink } from "@/shared/ui/SkipToContentLink";
import { Surface } from "@/shared/ui/Surface";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

interface PublicShellProps {
  children: ReactNode;
  currentPath: PublicRoute;
}

const PUBLIC_ACTION_CLASS = "min-h-11 rounded-2xl";

export async function PublicShell({ children, currentPath }: PublicShellProps) {
  const [tNavigation, tPublicShell, tCommon, tAppShell] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("publicShell"),
    getTranslations("common"),
    getTranslations("appShell"),
  ]);
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
    currentPath === publicRoutes.home
      ? {
          href: publicRoutes.signup,
          label: tNavigation("signup"),
        }
      : null;
  const mobileHeaderStyle = {
    paddingTop: "calc(var(--safe-area-top) + 0.75rem)",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-900">
      <SkipToContentLink
        label={tCommon("skipToContent")}
        targetId={MAIN_CONTENT_ID}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#faf7f1_0%,#efe6d6_100%)]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-8 lg:px-10">
        <header
          className="-mx-6 sticky top-0 z-20 px-6 pb-3 sm:mx-0 sm:mt-6 sm:px-0 sm:py-0"
          style={mobileHeaderStyle}
        >
          <Surface className="border-white/70 bg-white/82 px-4 pb-4 backdrop-blur supports-[backdrop-filter]:bg-white/72 sm:rounded-[1.75rem] sm:px-5 sm:py-4 sm:shadow-[0_20px_60px_-34px_rgba(120,53,15,0.28)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={publicRoutes.home}
                className="min-w-0 flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold tracking-tight text-white">
                  CC
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {tAppShell("title")}
                  </p>
                  <p className="hidden truncate text-xs text-stone-500 sm:block">
                    {tAppShell("subtitle")}
                  </p>
                </div>
              </Link>

              <nav
                aria-label={tPublicShell("navigationLabel")}
                className="flex w-full items-center gap-2 sm:w-auto sm:flex-wrap sm:justify-end"
              >
                {secondaryAction ? (
                  <div className="hidden sm:block">
                    <Link
                      href={secondaryAction.href}
                      className={buttonVariants("secondary", PUBLIC_ACTION_CLASS)}
                    >
                      {secondaryAction.label}
                    </Link>
                  </div>
                ) : null}

                <Link
                  href={primaryAction.href}
                  aria-current={
                    currentPath === primaryAction.href ? "page" : undefined
                  }
                  className={buttonVariants(
                    primaryAction.variant,
                    `${PUBLIC_ACTION_CLASS} w-full sm:w-auto`,
                  )}
                >
                  {primaryAction.label}
                </Link>
              </nav>
            </div>
          </Surface>
        </header>

        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex flex-1 items-center py-10 sm:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
