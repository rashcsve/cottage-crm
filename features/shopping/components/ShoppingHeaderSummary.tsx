import { useTranslations } from "next-intl";

interface ShoppingHeaderSummaryProps {
  pendingCount: number;
  addedTodayCount: number;
}

const SUMMARY_CLASS = "text-sm text-ink-secondary";
const SEPARATOR = " · ";

export function ShoppingHeaderSummary({
  pendingCount,
  addedTodayCount,
}: ShoppingHeaderSummaryProps) {
  const t = useTranslations("shopping");

  if (pendingCount === 0) {
    return <p className={SUMMARY_CLASS}>{t("summary.nothingToBuy")}</p>;
  }

  const parts = [t("summary.toBuy", { count: pendingCount })];

  if (addedTodayCount > 0) {
    parts.push(t("summary.addedToday", { count: addedTodayCount }));
  }

  return <p className={SUMMARY_CLASS}>{parts.join(SEPARATOR)}</p>;
}
