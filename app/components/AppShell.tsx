import { signOutAction } from "@/app/(dashboard)/actions";
import Link from "next/link";
import { ReactNode } from "react";
import { UserRole } from "@/lib/types/profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";

type AppShellProps = {
  title: string;
  children: ReactNode;
  userName?: string;
  userRole?: UserRole;
};

const navigationItems = [
  { href: "/", label: "Domů" },
  { href: "/visits", label: "Návštěvy" },
  { href: "/shopping", label: "Nákupní seznam" },
  { href: "/tasks", label: "Úkoly" },
  { href: "/notes", label: "Poznámky" },
];

export function AppShell({
  title,
  children,
  userName,
  userRole,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-8">
            <h1 className="text-2xl font-bold tracking-tight">Chata CRM</h1>
            <p className="mt-2 text-sm text-stone-600">Rodinný přehled chaty</p>

            {userName && (
              <div className="mt-4 border-l-2 border-stone-300 pl-3">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {userName}
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                  {userRole && isAdminRole(userRole) && (
                    <>
                      <span>Správce</span>
                      <span className="text-stone-300">•</span>
                    </>
                  )}

                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="cursor-pointer font-medium text-stone-500 transition hover:text-stone-800"
                    >
                      Odhlásit se
                    </button>
                  </form>
                </div>
              </div>
            )}

            <nav className="mt-8 flex flex-col gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
