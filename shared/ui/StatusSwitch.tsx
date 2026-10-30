import { Link } from "@/i18n/navigation";
import type { NavigationHref } from "@/shared/hooks/useOptimisticNavigation";

export interface StatusSwitchItem<TFilter extends string> {
  filter: TFilter;
  label: string;
  count: number;
  countUnit: string;
}

interface StatusSwitchProps<TFilter extends string> {
  activeFilter: TFilter;
  items: StatusSwitchItem<TFilter>[];
  ariaLabel: string;
  pathname: string;
  onNavigate?: (filter: TFilter, href: NavigationHref) => void;
}

const LINK_BASE_CLASS =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control px-4 text-sm transition-colors";
const LINK_ACTIVE_CLASS = "bg-surface font-semibold text-ink-primary";
const LINK_INACTIVE_CLASS = "font-medium text-ink-secondary hover:text-ink-primary";
const COUNT_CLASS = "font-mono text-xs tabular-nums";

export function StatusSwitch<TFilter extends string>({
  activeFilter,
  items,
  ariaLabel,
  pathname,
  onNavigate,
}: StatusSwitchProps<TFilter>) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex gap-1 rounded-control bg-muted p-1">
        {items.map((item) => {
          const isActive = activeFilter === item.filter;
          const href = { pathname, query: { filter: item.filter } };

          return (
            <li key={item.filter} className="flex flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                onNavigate={
                  onNavigate
                    ? (event) => {
                        event.preventDefault();
                        onNavigate(item.filter, href);
                      }
                    : undefined
                }
                className={`${LINK_BASE_CLASS} ${isActive ? LINK_ACTIVE_CLASS : LINK_INACTIVE_CLASS}`}
              >
                <span>{item.label}</span>{" "}
                <span className={COUNT_CLASS}>{item.count}</span>{" "}
                <span className="sr-only">{item.countUnit}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
