import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { publicRoutes } from "@/lib/routes";
import { LanguageSwitcher } from "../LanguageSwitcher";

interface HeaderProps {
  demoHref: string | null;
}

const NAV_LINK_CLASS =
  "rounded-md text-sm font-semibold text-ink-secondary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-page";

export async function Header({ demoHref }: HeaderProps) {
  const [tNavigation, tAppShell, tDemo] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("appShell"),
    getTranslations("demo"),
  ]);

  return (
    <header className="relative z-20 px-6 py-6 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href={publicRoutes.home}
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-xs font-semibold text-white">
            CC
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            {tAppShell("title")}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher
            ariaLabel={tAppShell("languageSwitcherLabel")}
            size="compact"
          />
          {demoHref ? (
            <a href={demoHref} className={NAV_LINK_CLASS}>
              {tDemo("tryButton")}
            </a>
          ) : (
            <Link href={publicRoutes.login} className={NAV_LINK_CLASS}>
              {tNavigation("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}