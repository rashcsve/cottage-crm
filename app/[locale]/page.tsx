import { Link } from "@/i18n/navigation";
import { CalendarRange, ListTodo, NotebookPen, ShoppingCart } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createPageMetadata } from "./metadata";
import { PublicShell } from "./components/PublicShell";

const sections = [
  {
    key: "visits",
    Icon: CalendarRange,
  },
  {
    key: "shopping",
    Icon: ShoppingCart,
  },
  {
    key: "tasks",
    Icon: ListTodo,
  },
  {
    key: "notes",
    Icon: NotebookPen,
  },
] as const;

export const generateMetadata = createPageMetadata("home", {
  titleKey: "metaTitle",
  descriptionKey: "metaDescription",
});

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <PublicShell currentPath="/" contentVariant="marketing">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-10">
        <div className="space-y-8 sm:space-y-9">
          <div className="space-y-4 sm:space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              {t("eyebrow")}
            </p>
            <h1 className="max-w-3xl text-[2.75rem] font-semibold leading-[0.94] tracking-tight text-stone-900 sm:text-6xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
              {t("description")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-6 text-sm font-semibold text-white shadow-[0_18px_30px_-20px_rgba(28,25,23,0.65)] transition hover:bg-stone-800"
            >
              {t("primaryCta")}
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:text-stone-900"
            >
              {t("secondaryCta")}
            </Link>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            {t("supportingCopy")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {sections.map(({ key, Icon }) => (
            <section
              key={key}
              className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_60px_-36px_rgba(28,25,23,0.38)] backdrop-blur"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-stone-900">
                {t(`sections.${key}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {t(`sections.${key}.description`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
