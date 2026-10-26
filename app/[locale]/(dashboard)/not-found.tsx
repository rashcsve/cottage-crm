import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";
import { PageFeedback } from "@/shared/ui/page/PageFeedback";

export default async function DashboardNotFound() {
  const [t, tNavigation, tMetadata] = await Promise.all([
    getTranslations("systemPages.notFound"),
    getTranslations("navigation"),
    getTranslations("metadata"),
  ]);

  return (
    <>
      <title>{`${t("title")} | ${tMetadata("title")}`}</title>
      <PageFeedback
        size="wide"
        title={t("title")}
        description={t("description")}
        actions={
          <Link
            href={dashboardRoutes.overview}
            className={buttonVariants("primary")}
          >
            {tNavigation("overview")}
          </Link>
        }
      />
    </>
  );
}
