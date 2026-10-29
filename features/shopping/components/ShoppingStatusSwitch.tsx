import { useTranslations } from "next-intl";
import type { ShoppingFilter } from "@/features/shopping/types/shopping";
import { StatusSwitch } from "@/shared/ui/StatusSwitch";

interface ShoppingStatusSwitchProps {
  activeFilter: ShoppingFilter;
  pendingCount: number;
  purchasedCount: number;
}

export function ShoppingStatusSwitch({
  activeFilter,
  pendingCount,
  purchasedCount,
}: ShoppingStatusSwitchProps) {
  const t = useTranslations("shopping");

  return (
    <StatusSwitch
      activeFilter={activeFilter}
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
