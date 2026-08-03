import { getTranslations } from "next-intl/server";

export async function DemoModeBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "1") {
    return null;
  }

  const t = await getTranslations("demo");

  return (
    <div className="w-full bg-amber-500/95 px-4 py-1.5 text-center text-xs font-medium text-amber-950">
      {t("banner")}
    </div>
  );
}
