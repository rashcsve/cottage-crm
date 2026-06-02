"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { publicRoutes } from "@/lib/routes";
import { Button, buttonVariants } from "@/shared/ui/Button";
import { PageFeedback } from "@/shared/ui/page/PageFeedback";

export default function LocaleError({
  reset,
}: {
  reset: () => void;
}) {
  const t = useTranslations("systemPages.error");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <PageFeedback
        tone="error"
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Button type="button" onClick={() => reset()}>
              {t("retry")}
            </Button>
            <Link
              href={publicRoutes.home}
              className={buttonVariants("secondary")}
            >
              {t("homeCta")}
            </Link>
          </>
        }
      />
    </div>
  );
}
