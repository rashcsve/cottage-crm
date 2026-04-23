import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dashboardRoutes, publicRoutes } from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";
import { PageFeedback } from "@/shared/ui/page/PageFeedback";

export default async function LocaleNotFound() {
  const t = await getTranslations("systemPages.notFound");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <PageFeedback
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Link
              href={publicRoutes.home}
              className={buttonVariants("primary")}
            >
              {t("homeCta")}
            </Link>
            <Link
              href={dashboardRoutes.overview}
              className={buttonVariants("secondary")}
            >
              {t("dashboardCta")}
            </Link>
          </>
        }
      />
    </div>
  );
}
