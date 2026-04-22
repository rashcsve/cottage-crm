import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dashboardRoutes, publicRoutes } from "@/lib/routes";
import { PageFeedback } from "@/shared/ui/page/PageFeedback";

export default async function LocaleNotFound() {
  const t = await getTranslations("systemPages.notFound");

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <PageFeedback
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Link
              href={publicRoutes.home}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              {t("homeCta")}
            </Link>
            <Link
              href={dashboardRoutes.tasks}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-900"
            >
              {t("dashboardCta")}
            </Link>
          </>
        }
      />
    </div>
  );
}
