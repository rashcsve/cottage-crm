import { useTranslations } from "next-intl";
import type { TaskFilter } from "@/features/tasks/types/tasks";
import type { NavigationHref } from "@/shared/hooks/useOptimisticNavigation";
import { StatusSwitch } from "@/shared/ui/StatusSwitch";

interface TasksStatusSwitchProps {
  activeFilter: TaskFilter;
  onNavigate?: (filter: TaskFilter, href: NavigationHref) => void;
  openCount: number;
  doneCount: number;
}

export function TasksStatusSwitch({
  activeFilter,
  onNavigate,
  openCount,
  doneCount,
}: TasksStatusSwitchProps) {
  const t = useTranslations("tasks");

  return (
    <StatusSwitch
      activeFilter={activeFilter}
      onNavigate={onNavigate}
      ariaLabel={t("switch.ariaLabel")}
      pathname="/tasks"
      items={[
        {
          filter: "open",
          label: t("switch.open"),
          count: openCount,
          countUnit: t("switch.countUnit", { count: openCount }),
        },
        {
          filter: "done",
          label: t("switch.done"),
          count: doneCount,
          countUnit: t("switch.countUnit", { count: doneCount }),
        },
      ]}
    />
  );
}
