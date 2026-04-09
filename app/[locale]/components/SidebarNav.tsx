"use client";

import { Link, usePathname } from "@/i18n/navigation";

interface NavigationItem {
  href: string;
  label: string;
}

interface SidebarNavProps {
  items: NavigationItem[];
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-col gap-1">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-xl bg-stone-200 px-3 py-2 text-sm font-semibold text-stone-900"
                : "rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
