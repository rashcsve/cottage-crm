"use client";

import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { Button, buttonVariants } from "@/shared/ui/Button";
import { PageFeedback } from "@/shared/ui/page/PageFeedback";
import { useTranslations } from "next-intl";

export default function DashboardError({ reset }: { reset: () => void }) {
  const t = useTranslations("dashboard.error");

  return (
    <PageFeedback
      tone="error"
      size="wide"
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <Button type="button" onClick={() => reset()}>
            {t("retry")}
          </Button>
          <Link
            href={dashboardRoutes.tasks}
            className={buttonVariants("secondary")}
          >
            {t("fallbackCta")}
          </Link>
        </>
      }
    />
  );
}
