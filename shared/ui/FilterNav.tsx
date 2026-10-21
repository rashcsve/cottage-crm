import { Link } from "@/i18n/navigation";

export interface FilterNavItem<TFilter extends string> {
  label: string;
  value: number;
  filter: TFilter;
}

interface FilterNavProps<TFilter extends string> {
  activeFilter: TFilter;
  items: FilterNavItem<TFilter>[];
  ariaLabel: string;
  pathname: string;
}

const LINK_BASE_CLASS =
  "-mb-px flex min-h-11 items-center gap-2 border-b-2 px-1 text-sm transition-colors";
const LINK_ACTIVE_CLASS = "border-accent font-semibold text-ink-primary";
const LINK_INACTIVE_CLASS =
  "border-transparent font-medium text-ink-secondary hover:text-ink-primary";
const COUNT_BASE_CLASS = "shrink-0 font-mono text-xs tabular-nums";
const COUNT_ACTIVE_CLASS = "text-ink-primary";
const COUNT_INACTIVE_CLASS = "text-ink-muted";

export function FilterNav<TFilter extends string>({
  activeFilter,
  items,
  ariaLabel,
  pathname,
}: FilterNavProps<TFilter>) {
  return (
    <nav aria-label={ariaLabel} className="min-w-0">
      <ul className="flex min-w-0 flex-wrap gap-x-6 border-b border-border">
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
                  pathname,
                  query: { filter: item.filter },
                }}
                aria-current={isActive ? "page" : undefined}
                aria-label={`${item.label} (${item.value})`}
                className={linkClass}
              >
                <span className="text-left">{item.label}</span>
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
