import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

interface PublicShellProps {
  children: ReactNode;
  currentPath: "/" | "/login" | "/signup";
}

export async function PublicShell({
  children,
  currentPath,
}: PublicShellProps) {
  const [tNavigation, tLogin, tSignup, tHome] = await Promise.all([
    getTranslations("navigation"),
    getTranslations("auth.login"),
    getTranslations("auth.signup"),
    getTranslations("home"),
  ]);

  const navigationItems = [
    { href: "/" as const, label: tNavigation("home") },
    { href: "/login" as const, label: tLogin("pageTitle") },
    { href: "/signup" as const, label: tSignup("pageTitle") },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#faf7f1_0%,#efe6d6_100%)]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_20px_60px_-30px_rgba(120,53,15,0.28)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-stone-700 uppercase"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-sm tracking-normal text-white">
              CC
            </span>
            <span>Chata CRM</span>
          </Link>

          <nav
            aria-label={tHome("navigationLabel")}
            className="flex flex-wrap items-center gap-2"
          >
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "inline-flex min-h-11 items-center justify-center rounded-2xl bg-stone-900 px-4 text-sm font-medium text-white"
                      : "inline-flex min-h-11 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:text-stone-900"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex flex-1 items-center py-12">{children}</main>
      </div>
    </div>
  );
}
