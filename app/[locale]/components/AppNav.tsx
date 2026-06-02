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
  variant?: "rail" | "mobile";
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

const RAIL_BASE =
  "group flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center text-xs font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2";
const RAIL_ACTIVE = `${RAIL_BASE} bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200`;
const RAIL_INACTIVE = `${RAIL_BASE} text-zinc-500 hover:bg-white/80 hover:text-zinc-900`;

const MOBILE_BASE =
  "group flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center text-xs font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2";
const MOBILE_ACTIVE = `${MOBILE_BASE} text-zinc-950`;
const MOBILE_INACTIVE = `${MOBILE_BASE} text-zinc-400 hover:text-zinc-800`;

export function AppNav({
  items,
  ariaLabel,
  variant = "rail",
  className = "",
}: AppNavProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";
  const mobileColumnCount = Math.min(Math.max(items.length, 1), 5);

  const listClassName = isMobile
    ? "m-0 grid list-none gap-1 p-0"
    : "m-0 flex w-full list-none flex-col gap-1 p-0";

  return (
    <nav aria-label={ariaLabel} className={className.trim() || undefined}>
      <ul
        className={listClassName}
        style={
          isMobile
            ? {
                gridTemplateColumns: `repeat(${mobileColumnCount}, minmax(0, 1fr))`,
              }
            : undefined
        }
      >
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
              ? RAIL_ACTIVE
              : RAIL_INACTIVE;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={usesShortLabel ? item.label : undefined}
                className={linkClassName}
              >
                {Icon ? (
                  isMobile ? (
                    <span
                      className={
                        isActive
                          ? "flex h-7 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white"
                          : "flex h-7 w-11 shrink-0 items-center justify-center"
                      }
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : (
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )
                ) : null}
                <span className="block w-full max-w-full truncate">
                  {visibleLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
