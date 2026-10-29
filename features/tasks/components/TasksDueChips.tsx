import { useTranslations } from "next-intl";
import type { TaskDueFilter } from "@/features/tasks/types/tasks";
import { Link } from "@/i18n/navigation";

interface TasksDueChipsProps {
  activeDue: TaskDueFilter;
}

const DUE_FILTERS: TaskDueFilter[] = ["all", "week", "none"];

const CHIP_BASE_CLASS =
  "flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors";
const CHIP_ACTIVE_CLASS = "border-accent bg-accent font-semibold text-on-accent";
const CHIP_INACTIVE_CLASS =
  "border-border bg-surface font-medium text-ink-secondary hover:text-ink-primary";

function getDueQuery(due: TaskDueFilter): Record<string, string> {
  if (due === "all") {
    return { filter: "open" };
  }

  return { filter: "open", due };
}

export function TasksDueChips({ activeDue }: TasksDueChipsProps) {
  const t = useTranslations("tasks");

  return (
    <nav aria-label={t("dueFilter.ariaLabel")}>
      <ul className="flex flex-wrap gap-2">
        {DUE_FILTERS.map((due) => {
          const isActive = activeDue === due;

          return (
            <li key={due}>
              <Link
                href={{ pathname: "/tasks", query: getDueQuery(due) }}
                aria-current={isActive ? "page" : undefined}
                className={`${CHIP_BASE_CLASS} ${isActive ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS}`}
              >
                {t(`dueFilter.${due}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
