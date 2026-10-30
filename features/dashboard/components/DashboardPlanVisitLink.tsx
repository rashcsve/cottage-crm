import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";

export function DashboardPlanVisitLink({ label }: { label: string }) {
  return (
    <Link
      href={dashboardRoutes.visits}
      className={buttonVariants("primary", "min-h-12 w-full justify-between!")}
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  );
}
