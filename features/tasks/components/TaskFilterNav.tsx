import { Link } from "@/i18n/navigation";
import type { TaskFilter } from "@/features/tasks/types/tasks";

export interface TaskFilterNavItem {
  label: string;
  value: number;
  filter: TaskFilter;
}

interface TaskFilterNavProps {
  activeFilter: TaskFilter;
  items: TaskFilterNavItem[];
  ariaLabel: string;
}

const LINK_BASE_CLASS =
  "flex w-full min-w-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const LINK_ACTIVE_CLASS = "bg-white font-semibold text-stone-900 shadow-sm";
const LINK_INACTIVE_CLASS = "font-medium text-stone-600 hover:text-stone-900";

const COUNT_BASE_CLASS = "shrink-0 tabular-nums text-xs";
const COUNT_ACTIVE_CLASS = "text-stone-900";
const COUNT_INACTIVE_CLASS = "text-stone-500";

export function TaskFilterNav({
  activeFilter,
  items,
  ariaLabel,
}: TaskFilterNavProps) {
  return (
    <nav aria-label={ariaLabel} className="min-w-0 w-full sm:w-auto">
      <ul className="grid w-full min-w-0 grid-cols-2 rounded-2xl border border-stone-200 bg-stone-50 p-1 sm:w-auto sm:min-w-56">
        {items.map((item) => {
          const isActive = activeFilter === item.filter;
          const linkClass = `${LINK_BASE_CLASS} ${
            isActive ? LINK_ACTIVE_CLASS : LINK_INACTIVE_CLASS
          }`;
          const countClass = `${COUNT_BASE_CLASS} ${
            isActive ? COUNT_ACTIVE_CLASS : COUNT_INACTIVE_CLASS
          }`;

          return (
            <li key={item.filter} className="min-w-0">
              <Link
                href={{
                  pathname: "/tasks",
                  query: { filter: item.filter },
                }}
                aria-current={isActive ? "page" : undefined}
                className={linkClass}
              >
                <span className="truncate text-left">{item.label}</span>
                <span className={countClass} aria-hidden="true">
                  {item.value}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
