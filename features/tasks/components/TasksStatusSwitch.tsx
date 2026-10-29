import { useTranslations } from "next-intl";
import type { TaskFilter } from "@/features/tasks/types/tasks";
import { StatusSwitch } from "@/shared/ui/StatusSwitch";

interface TasksStatusSwitchProps {
  activeFilter: TaskFilter;
  openCount: number;
  doneCount: number;
}

export function TasksStatusSwitch({
  activeFilter,
  openCount,
  doneCount,
}: TasksStatusSwitchProps) {
  const t = useTranslations("tasks");

  return (
    <StatusSwitch
      activeFilter={activeFilter}
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
