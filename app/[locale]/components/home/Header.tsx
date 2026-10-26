import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { publicRoutes } from "@/lib/routes";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { WordmarkLink } from "../WordmarkLink";

interface HeaderProps {
  demoHref: string | null;
}

const NAV_LINK_CLASS =
  "inline-flex min-h-11 items-center text-sm font-semibold text-ink-secondary transition-colors hover:text-ink-primary";

export async function Header({ demoHref }: HeaderProps) {
  const [tNavigation, tAppShell, tDemo] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("appShell"),
    getTranslations("demo"),
  ]);

  return (
    <header className="relative z-20 px-6 py-6 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <WordmarkLink href={publicRoutes.home} label={tAppShell("title")} />

        <div className="flex items-center gap-4">
          <LanguageSwitcher
            ariaLabel={tAppShell("languageSwitcherLabel")}
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
