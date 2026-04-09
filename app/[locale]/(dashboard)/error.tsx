"use client";

import { useTranslations } from "next-intl";

export default function DashboardError({ reset }: { reset: () => void }) {
  const t = useTranslations("dashboard.error");

  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
    >
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="mt-2 text-sm text-red-700">
        {t("description")}
      </p>

      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        {t("retry")}
      </button>
    </div>
  );
}
