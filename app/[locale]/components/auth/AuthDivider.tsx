"use client";

import { useTranslations } from "next-intl";

export function AuthDivider() {
  const t = useTranslations("auth.oauth");

  return (
    <div className="flex items-center gap-3 text-sm text-ink-secondary">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span>{t("divider")}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}
