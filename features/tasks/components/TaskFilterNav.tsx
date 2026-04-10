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

const NAV_LIST_CLASS = "inline-flex flex-wrap rounded-2xl bg-stone-100 p-1";

const LINK_BASE_CLASS =
  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const LINK_ACTIVE_CLASS = "bg-white font-semibold text-stone-900 shadow-sm";
const LINK_INACTIVE_CLASS = "font-medium text-stone-600 hover:text-stone-900";

const COUNT_BASE_CLASS = "tabular-nums";
const COUNT_ACTIVE_CLASS = "text-stone-900";
const COUNT_INACTIVE_CLASS = "text-stone-500";

export function TaskFilterNav({
  activeFilter,
  items,
  ariaLabel,
}: TaskFilterNavProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className={NAV_LIST_CLASS}>
        {items.map((item) => {
          const isActive = activeFilter === item.filter;
          const linkClass = `${LINK_BASE_CLASS} ${
            isActive ? LINK_ACTIVE_CLASS : LINK_INACTIVE_CLASS
          }`;
          const countClass = `${COUNT_BASE_CLASS} ${
            isActive ? COUNT_ACTIVE_CLASS : COUNT_INACTIVE_CLASS
          }`;

          return (
            <li key={item.filter}>
              <Link
                href={{
                  pathname: "/tasks",
                  query: { filter: item.filter },
                }}
                aria-current={isActive ? "page" : undefined}
                className={linkClass}
              >
                <span>{item.label}</span>
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
