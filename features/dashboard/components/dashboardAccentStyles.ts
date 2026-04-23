export type DashboardAccent = "visits" | "tasks" | "shopping" | "notes";

interface DashboardAccentStyles {
  bar: string;
  countBadge: string;
  hoverBorder: string;
  icon: string;
}

export const DASHBOARD_ACCENT_STYLES = {
  visits: {
    bar: "bg-emerald-500/75",
    countBadge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    hoverBorder: "hover:border-emerald-200",
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  tasks: {
    bar: "bg-amber-400/85",
    countBadge: "border-amber-200 bg-amber-50 text-amber-700",
    hoverBorder: "hover:border-amber-200",
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  shopping: {
    bar: "bg-blue-500/70",
    countBadge: "border-blue-200 bg-blue-50 text-blue-700",
    hoverBorder: "hover:border-blue-200",
    icon: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  notes: {
    bar: "bg-stone-300",
    countBadge: "border-stone-200 bg-stone-100 text-stone-700",
    hoverBorder: "hover:border-stone-300",
    icon: "bg-stone-50 text-stone-700 ring-stone-200/80",
  },
} satisfies Record<DashboardAccent, DashboardAccentStyles>;
