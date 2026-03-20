import { PageHeader } from "@/shared/ui/PageHeader";
import {
  StatusBadge,
  statusBadgeTone,
  StatusBadgeTone,
} from "@/shared/ui/StatusBadge";

interface TaskPageHeaderProps {
  pendingCount: number;
  overdueCount: number;
  completionRate: number;
  canManage: boolean;
}

interface SummaryItem {
  label: string;
  value: string | number;
  tone: StatusBadgeTone;
}

function TaskSummaryBadge({ label, value, tone }: SummaryItem) {
  return (
    <StatusBadge tone={tone} className="gap-2 px-3 py-1.5 text-sm">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </StatusBadge>
  );
}

export function TaskPageHeader({
  pendingCount,
  overdueCount,
  completionRate,
  canManage,
}: TaskPageHeaderProps) {
  const summaryItems: SummaryItem[] = [
    { label: "Otevřené", value: pendingCount, tone: statusBadgeTone.neutral },
    ...(overdueCount > 0
      ? [
          {
            label: "Po termínu",
            value: overdueCount,
            tone: statusBadgeTone.warning,
          },
        ]
      : []),
    {
      label: "Dokončeno",
      value: `${completionRate} %`,
      tone: statusBadgeTone.success,
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <PageHeader title="Úkoly" />

        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          Přehled práce kolem chaty.
        </p>

        <ul className="flex flex-wrap gap-2 pt-1">
          {summaryItems.map((item) => (
            <li key={item.label}>
              <TaskSummaryBadge
                label={item.label}
                value={item.value}
                tone={item.tone}
              />
            </li>
          ))}
        </ul>
      </div>

      {canManage && (
        <a
          href="#new-task-form"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800 xl:hidden"
        >
          Přidat úkol
        </a>
      )}
    </div>
  );
}
