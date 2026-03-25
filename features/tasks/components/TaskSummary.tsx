import { getTranslations } from "next-intl/server";

interface TaskSummaryProps {
  totalCount: number;
  overdueCount: number;
  completionRate: number;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}

export async function TaskSummary({
  totalCount,
  overdueCount,
  completionRate,
}: TaskSummaryProps) {
  const t = await getTranslations("tasks.summary");

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          {t("overview")}
        </p>
        <h2 className="text-lg font-semibold text-stone-900">{t("title")}</h2>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <StatCard label={t("total")} value={totalCount} />
        <StatCard label={t("overdue")} value={overdueCount} />
        <StatCard label={t("completionRate")} value={`${completionRate} %`} />
      </div>
    </section>
  );
}
