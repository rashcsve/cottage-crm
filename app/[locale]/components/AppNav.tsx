"use client";

import {
  CalendarDays,
  Home,
  ListChecks,
  NotebookText,
  Package,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

export interface NavigationItem {
  href: string;
  label: string;
  shortLabel?: string;
}

interface AppNavProps {
  items: NavigationItem[];
  ariaLabel?: string;
  variant?: "top" | "mobile";
  className?: string;
}

const NAVIGATION_ICONS = {
  "/overview": Home,
  "/notes": NotebookText,
  "/shopping": Package,
  "/tasks": ListChecks,
  "/visits": CalendarDays,
} as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const TOP_BASE =
  "flex h-full items-center border-b-2 pt-0.5 text-sm transition-colors focus-inset";
const TOP_ACTIVE = `${TOP_BASE} border-accent font-bold text-ink-primary`;
const TOP_INACTIVE = `${TOP_BASE} border-transparent font-medium text-ink-secondary hover:text-ink-primary`;

const MOBILE_BASE =
  "relative flex min-h-15 flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-center text-2xs leading-tight font-semibold break-words transition-colors before:absolute before:inset-x-2 before:top-0 before:h-0.75 focus-inset";
const MOBILE_ACTIVE = `${MOBILE_BASE} text-accent before:bg-accent`;
const MOBILE_INACTIVE = `${MOBILE_BASE} text-ink-secondary hover:text-ink-primary`;

export function AppNav({
  items,
  ariaLabel,
  variant = "top",
  className = "",
}: AppNavProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  const listClassName = isMobile
    ? "m-0 grid list-none auto-cols-fr grid-flow-col p-0"
    : "m-0 flex h-full list-none items-stretch gap-7 p-0";

  return (
    <nav aria-label={ariaLabel} className={className.trim() || undefined}>
      <ul className={listClassName}>
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const Icon =
            NAVIGATION_ICONS[item.href as keyof typeof NAVIGATION_ICONS];
          const visibleLabel = item.shortLabel ?? item.label;
          const usesShortLabel = visibleLabel !== item.label;

          const linkClassName = isMobile
            ? isActive
              ? MOBILE_ACTIVE
              : MOBILE_INACTIVE
            : isActive
              ? TOP_ACTIVE
              : TOP_INACTIVE;

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={usesShortLabel ? item.label : undefined}
                className={linkClassName}
              >
                {isMobile && Icon ? (
                  <Icon
                    className="size-5.5 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="max-w-full">{visibleLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
