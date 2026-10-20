"use client";

import { useLocale } from "next-intl";
import { Fragment, useTransition } from "react";

import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/locales";
import { usePathname, useRouter } from "@/i18n/navigation";

interface LanguageSwitcherProps {
  ariaLabel: string;
  className?: string;
}

const LANGUAGE_NAMES: Record<SupportedLocale, string> = {
  cs: "Čeština",
  en: "English",
};

const OPTION_BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control font-mono text-xs transition-colors disabled:opacity-60";
const OPTION_ACTIVE = `${OPTION_BASE} font-semibold text-ink-primary underline decoration-2 underline-offset-4`;
const OPTION_INACTIVE = `${OPTION_BASE} font-medium text-ink-secondary hover:text-ink-primary`;

export function LanguageSwitcher({
  ariaLabel,
  className = "",
}: LanguageSwitcherProps) {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: SupportedLocale) {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-busy={isPending || undefined}
      className={`inline-flex items-center ${className}`.trim()}
    >
      {SUPPORTED_LOCALES.map((loc, index) => {
        const isActive = loc === locale;
        const optionLabel = LANGUAGE_NAMES[loc];

        return (
          <Fragment key={loc}>
            {index > 0 ? (
              <span className="font-mono text-xs text-ink-muted" aria-hidden="true">
                ·
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => switchLocale(loc)}
              aria-pressed={isActive}
              aria-label={optionLabel}
              disabled={isPending}
              lang={loc}
              title={optionLabel}
              className={isActive ? OPTION_ACTIVE : OPTION_INACTIVE}
            >
              <span aria-hidden="true">{loc.toUpperCase()}</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
