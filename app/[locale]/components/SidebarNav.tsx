"use client";

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

  const navClassName = isMobile
    ? `overflow-x-auto pb-1 ${className}`.trim()
    : `mt-8 ${className}`.trim();

  const listClassName = isMobile
    ? "m-0 flex min-w-max list-none gap-2 p-0"
    : "m-0 flex list-none flex-col gap-1 p-0";

  return (
    <nav aria-label={ariaLabel} className={navClassName}>
      <ul className={listClassName}>
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const baseClassName = isMobile
            ? "inline-flex shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
            : "block rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? `${baseClassName} bg-stone-200 font-semibold text-stone-900`
                    : `${baseClassName} text-stone-700 hover:bg-stone-200`
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
