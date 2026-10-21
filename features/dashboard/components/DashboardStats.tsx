import { TriangleAlert } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { StatusLabel } from "@/shared/ui/StatusLabel";

export type DashboardStatId = "visits" | "tasks" | "shopping" | "notes";

export interface DashboardStat {
  id: DashboardStatId;
  href: string;
  label: string;
  value: number;
  alert?: string;
}

interface DashboardStatsProps {
  ariaLabel: string;
  stats: DashboardStat[];
}

export function DashboardStats({ ariaLabel, stats }: DashboardStatsProps) {
  return (
    <section aria-label={ariaLabel} className="border-t border-ink-primary">
      <ul className="divide-y divide-border lg:grid lg:grid-cols-4 lg:divide-y-0">
        {stats.map(({ id, href, label, value, alert }) => (
          <li
            key={id}
            className="group lg:border-l lg:border-border lg:first:border-l-0"
          >
            <Link
              href={href}
              className="grid min-h-14 grid-cols-[1fr_auto] content-center items-center gap-x-4 gap-y-0.5 py-3 lg:h-full lg:grid-cols-1 lg:content-start lg:gap-y-1 lg:px-5 lg:py-4 lg:group-first:pl-0"
            >
              <span className="col-start-1 row-start-1 min-w-0 text-sm text-ink-secondary lg:row-start-2">
                {label}
              </span>{" "}
              <span className="col-start-2 row-span-2 row-start-1 font-mono text-stat-sm font-semibold tracking-data text-ink-primary transition-colors group-hover:text-accent lg:col-start-1 lg:row-span-1 lg:row-start-1 lg:text-stat">
                {value}
              </span>
              {alert ? (
                <span className="col-start-1 row-start-2 lg:row-start-3">
                  <span className="sr-only">, </span>
                  <StatusLabel
                    tone="danger"
                    icon={TriangleAlert}
                    className="text-xs"
                  >
                    {alert}
                  </StatusLabel>
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
