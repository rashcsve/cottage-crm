"use client";

import {
  CalendarRange,
  LayoutDashboard,
  ListTodo,
  NotebookPen,
  ShoppingCart,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

export interface NavigationItem {
  href: string;
  label: string;
}

interface SidebarNavProps {
  items: NavigationItem[];
  ariaLabel?: string;
  variant?: "sidebar" | "mobile";
  className?: string;
}

const NAVIGATION_ICONS = {
  "/overview": LayoutDashboard,
  "/notes": NotebookPen,
  "/shopping": ShoppingCart,
  "/tasks": ListTodo,
  "/visits": CalendarRange,
} as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  items,
  ariaLabel,
  variant = "sidebar",
  className = "",
}: SidebarNavProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  const navClassName = className.trim();

  const mobileColumnClassName =
    items.length >= 5 ? "grid-cols-5" : "grid-cols-4";

  const listClassName = isMobile
    ? `m-0 grid list-none ${mobileColumnClassName} gap-1 p-0`
    : "m-0 flex list-none flex-col gap-1 p-0";

  return (
    <nav aria-label={ariaLabel} className={navClassName}>
      <ul className={listClassName}>
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const Icon =
            NAVIGATION_ICONS[item.href as keyof typeof NAVIGATION_ICONS];
          const baseClassName = isMobile
            ? "group flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-1.5 py-2 text-center text-[10px] font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
            : "group flex items-center gap-3 rounded-[1.15rem] px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isMobile
                    ? isActive
                      ? `${baseClassName} bg-stone-900 text-white shadow-sm`
                      : `${baseClassName} text-stone-500 hover:bg-stone-100 hover:text-stone-900`
                    : isActive
                      ? `${baseClassName} bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/90`
                      : `${baseClassName} text-stone-500 hover:bg-white/80 hover:text-stone-900`
                }
              >
                {Icon ? (
                  <Icon
                    className={
                      isMobile
                        ? "h-4 w-4 shrink-0"
                        : "h-4 w-4 shrink-0 text-current"
                    }
                    aria-hidden="true"
                  />
                ) : null}
                <span className={isMobile ? "max-w-full" : "truncate"}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
