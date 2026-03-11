import Link from "next/link";

const sections = [
  {
    title: "Návštěvy",
    description: "Kdo tam byl nebo plánuje jet.",
    href: "/visits",
    emoji: "📅",
  },
  {
    title: "Nákupní seznam",
    description: "Co chybí, co kdo přivezl.",
    href: "/shopping",
    emoji: "🛒",
  },
  {
    title: "Úkoly",
    description: "Opravy, sečení a další práce.",
    href: "/tasks",
    emoji: "🛠️",
  },
  {
    title: "Poznámky",
    description: "Deník a krátké záznamy o dění.",
    href: "/notes",
    emoji: "📝",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-800">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Chata CRM</h1>
          <p className="mt-3 text-lg text-stone-600">
            Přehled návštěv, úkolů, nákupů a poznámek pro naši chatu.
          </p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-3xl">{section.emoji}</div>
              <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-stone-600">{section.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
