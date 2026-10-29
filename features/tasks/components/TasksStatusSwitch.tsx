import { useTranslations } from "next-intl";
import type { TaskFilter } from "@/features/tasks/types/tasks";
import { Link } from "@/i18n/navigation";

interface TasksStatusSwitchProps {
  activeFilter: TaskFilter;
  openCount: number;
  doneCount: number;
}

const LINK_BASE_CLASS =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control px-4 text-sm transition-colors";
const LINK_ACTIVE_CLASS = "bg-surface font-semibold text-ink-primary";
const LINK_INACTIVE_CLASS = "font-medium text-ink-secondary hover:text-ink-primary";
const COUNT_CLASS = "font-mono text-xs tabular-nums";

export function TasksStatusSwitch({
  activeFilter,
  openCount,
  doneCount,
}: TasksStatusSwitchProps) {
  const t = useTranslations("tasks");

  const items: { filter: TaskFilter; label: string; count: number }[] = [
    { filter: "open", label: t("switch.open"), count: openCount },
    { filter: "done", label: t("switch.done"), count: doneCount },
  ];

  return (
    <nav aria-label={t("switch.ariaLabel")}>
      <ul className="flex gap-1 rounded-control bg-muted p-1">
        {items.map((item) => {
          const isActive = activeFilter === item.filter;

          return (
            <li key={item.filter} className="flex flex-1">
              <Link
                href={{ pathname: "/tasks", query: { filter: item.filter } }}
                aria-current={isActive ? "page" : undefined}
                className={`${LINK_BASE_CLASS} ${isActive ? LINK_ACTIVE_CLASS : LINK_INACTIVE_CLASS}`}
              >
                <span>{item.label}</span>{" "}
                <span className={COUNT_CLASS}>{item.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
