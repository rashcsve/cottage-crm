"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { QuickAddBar } from "@/shared/ui/QuickAddBar";

const ShoppingQuickAdd = dynamic(() =>
  import("@/features/shopping/components/forms/ShoppingQuickAdd").then(
    (module) => module.ShoppingQuickAdd,
  ),
);

const SHEET_TITLE_ID = "shopping-add-sheet-title";

export function ShoppingQuickAddBar() {
  const t = useTranslations("shopping.quickAdd");

  return (
    <QuickAddBar
      labels={{
        button: t("button"),
        sheetTitle: t("sheetTitle"),
        close: t("close"),
      }}
      titleId={SHEET_TITLE_ID}
      getAddedMessage={(title) => t("added", { title })}
      renderForm={({ onAdded }) => (
        <ShoppingQuickAdd variant="sheet" onAdded={onAdded} />
      )}
    />
  );
}
