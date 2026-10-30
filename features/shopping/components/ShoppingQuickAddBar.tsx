"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuickAddSheet } from "@/shared/hooks/useQuickAddSheet";
import { AddItemFormPanel } from "@/shared/ui/AddItemFormPanel";
import { Button } from "@/shared/ui/Button";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";

const ShoppingQuickAdd = dynamic(() =>
  import("@/features/shopping/components/forms/ShoppingQuickAdd").then(
    (module) => module.ShoppingQuickAdd,
  ),
);

const SHEET_TITLE_ID = "shopping-add-sheet-title";

export function ShoppingQuickAddBar() {
  const t = useTranslations("shopping.quickAdd");
  const sheet = useQuickAddSheet((title) => t("added", { title }));

  return (
    <>
      <QuickAddAnnouncer announcement={sheet.announcement} />

      <MobileActionBar>
        <Button type="button" onClick={sheet.open} className="w-full min-h-12">
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          {t("button")}
        </Button>
      </MobileActionBar>

      <AddItemFormPanel
        open={sheet.isOpen}
        onClose={sheet.close}
        title={t("sheetTitle")}
        titleId={SHEET_TITLE_ID}
        closeLabel={t("close")}
      >
        <ShoppingQuickAdd variant="sheet" onAdded={sheet.handleAdded} />
      </AddItemFormPanel>
    </>
  );
}
