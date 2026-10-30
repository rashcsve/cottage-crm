import { useTranslations } from "next-intl";

interface NotesHeaderSummaryProps {
  totalCount: number;
  thisWeekCount: number;
}

const SUMMARY_CLASS = "text-sm text-ink-secondary";
const SEPARATOR = " · ";

export function NotesHeaderSummary({
  totalCount,
  thisWeekCount,
}: NotesHeaderSummaryProps) {
  const t = useTranslations("notes");

  if (totalCount === 0) {
    return <p className={SUMMARY_CLASS}>{t("summary.nothing")}</p>;
  }

  const parts = [t("summary.total", { count: totalCount })];

  if (thisWeekCount > 0) {
    parts.push(t("summary.thisWeek", { count: thisWeekCount }));
  }

  return <p className={SUMMARY_CLASS}>{parts.join(SEPARATOR)}</p>;
}
