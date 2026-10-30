import { useTranslations } from "next-intl";
import type { ShoppingFilter } from "@/features/shopping/types/shopping";
import type { NavigationHref } from "@/shared/hooks/useOptimisticNavigation";
import { StatusSwitch } from "@/shared/ui/StatusSwitch";

interface ShoppingStatusSwitchProps {
  activeFilter: ShoppingFilter;
  onNavigate?: (filter: ShoppingFilter, href: NavigationHref) => void;
  pendingCount: number;
  purchasedCount: number;
}

export function ShoppingStatusSwitch({
  activeFilter,
  onNavigate,
  pendingCount,
  purchasedCount,
}: ShoppingStatusSwitchProps) {
  const t = useTranslations("shopping");

  return (
    <StatusSwitch
      activeFilter={activeFilter}
      onNavigate={onNavigate}
      ariaLabel={t("switch.ariaLabel")}
      pathname="/shopping"
      items={[
        {
          filter: "pending",
          label: t("switch.pending"),
          count: pendingCount,
          countUnit: t("switch.countUnit", { count: pendingCount }),
        },
        {
          filter: "purchased",
          label: t("switch.purchased"),
          count: purchasedCount,
          countUnit: t("switch.countUnit", { count: purchasedCount }),
        },
      ]}
    />
  );
}
