import { useTranslations } from "next-intl";

interface TasksHeaderSummaryProps {
  openCount: number;
  overdueCount: number;
}

const SUMMARY_CLASS = "text-sm text-ink-secondary";
const SEPARATOR = " · ";

export function TasksHeaderSummary({
  openCount,
  overdueCount,
}: TasksHeaderSummaryProps) {
  const t = useTranslations("tasks");

  if (openCount === 0) {
    return <p className={SUMMARY_CLASS}>{t("summary.nothingOpen")}</p>;
  }

  const parts = [t("summary.open", { count: openCount })];

  if (overdueCount > 0) {
    parts.push(t("summary.overdue", { count: overdueCount }));
  }

  return <p className={SUMMARY_CLASS}>{parts.join(SEPARATOR)}</p>;
}
