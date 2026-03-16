import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  title: string;
  children: ReactNode;
  userName?: string;
  userRole?: "admin" | "viewer";
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
              <div className="mt-2">
                <span className="text-sm font-semibold text-stone-800">
                  {userName}:
                </span>{" "}
                <span className="text-stone-600">
                  {" "}
                  {userRole === "admin" ? "Admin" : "Viewer"}
                </span>
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
