import { getTranslations } from "next-intl/server";

export async function DemoBanner() {
  const t = await getTranslations("demo");

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
    >
      <p className="whitespace-nowrap rounded-full border border-amber-300/60 bg-amber-50/95 px-4 py-1.5 text-xs font-medium text-amber-800 shadow-sm backdrop-blur">
        {t("banner")}
      </p>
    </div>
  );
}
