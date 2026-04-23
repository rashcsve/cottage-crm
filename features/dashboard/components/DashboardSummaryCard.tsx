import type { LucideIcon } from "lucide-react";

import {
  DASHBOARD_ACCENT_STYLES,
  type DashboardAccent,
} from "@/features/dashboard/components/dashboardAccentStyles";
import { Link } from "@/i18n/navigation";

interface DashboardSummaryCardProps {
  accent: DashboardAccent;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function DashboardSummaryCard({
  accent,
  description,
  href,
  icon: Icon,
  label,
  value,
}: DashboardSummaryCardProps) {
  const accentStyles = DASHBOARD_ACCENT_STYLES[accent];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-[0_18px_42px_-32px_rgba(28,25,23,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 ${accentStyles.hoverBorder}`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${accentStyles.bar}`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-950">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${accentStyles.icon}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
    </Link>
  );
}
