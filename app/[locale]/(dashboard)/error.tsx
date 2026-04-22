"use client";

import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
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
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            {t("retry")}
          </button>
          <Link
            href={dashboardRoutes.tasks}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-900"
          >
            {t("fallbackCta")}
          </Link>
        </>
      }
    />
  );
}
