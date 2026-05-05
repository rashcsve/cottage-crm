"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/locales";
import { usePathname, useRouter } from "@/i18n/navigation";

interface LanguageSwitcherProps {
  ariaLabel: string;
  className?: string;
  size?: "compact" | "default";
}

const LANGUAGE_NAMES: Record<SupportedLocale, string> = {
  cs: "Čeština",
  en: "English",
};

const ROOT_CLASS_NAMES = {
  compact:
    "inline-flex items-center gap-0.5 rounded-lg border border-zinc-200/90 bg-zinc-100/95 p-[2px] shadow-sm",
  default:
    "inline-flex items-center gap-0.5 rounded-xl border border-zinc-200/90 bg-white/95 p-[2px] shadow-sm",
} as const;

const ACTIVE_CLASS_NAMES = {
  compact:
    "min-h-7 min-w-8 rounded-md bg-white px-1.5 text-[10px] font-bold uppercase text-zinc-950 shadow-sm ring-1 ring-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1",
  default:
    "min-h-8 min-w-9 rounded-lg bg-zinc-950 px-2 text-[10px] font-bold uppercase text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1",
} as const;

const INACTIVE_CLASS_NAMES = {
  compact:
    "min-h-7 min-w-8 rounded-md px-1.5 text-[10px] font-semibold uppercase text-zinc-500 transition hover:bg-white/70 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1 disabled:opacity-50",
  default:
    "min-h-8 min-w-9 rounded-lg px-2 text-[10px] font-semibold uppercase text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1 disabled:opacity-50",
} as const;

export function LanguageSwitcher({
  ariaLabel,
  className = "",
  size = "default",
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
      className={`${ROOT_CLASS_NAMES[size]} ${className}`.trim()}
    >
      {SUPPORTED_LOCALES.map((loc) => {
        const isActive = loc === locale;
        const optionLabel = LANGUAGE_NAMES[loc];

        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            aria-pressed={isActive}
            aria-label={optionLabel}
            disabled={isPending}
            lang={loc}
            title={optionLabel}
            className={
              isActive
                ? ACTIVE_CLASS_NAMES[size]
                : INACTIVE_CLASS_NAMES[size]
            }
          >
            <span aria-hidden="true">{loc.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
