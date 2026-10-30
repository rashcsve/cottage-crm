"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { QuickAddAnnouncement } from "@/shared/hooks/useQuickAddSubmit";
import { AddItemPanel } from "@/shared/ui/AddItemPanel";
import { Button } from "@/shared/ui/Button";
import { FormLoadBoundary } from "@/shared/ui/Form/FormLoadBoundary";
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
  const tCommon = useTranslations("common");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<QuickAddAnnouncement>({
    id: 0,
    text: "",
  });

  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  function handleAdded(title: string) {
    setAnnouncement((previous) => ({
      id: previous.id + 1,
      text: t("added", { title }),
    }));
    closeSheet();
  }

  return (
    <>
      <QuickAddAnnouncer announcement={announcement} />

      <MobileActionBar>
        <Button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="w-full min-h-12"
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          {t("button")}
        </Button>
      </MobileActionBar>

      <AddItemPanel
        open={isSheetOpen}
        onClose={closeSheet}
        title={t("sheetTitle")}
        titleId={SHEET_TITLE_ID}
        closeLabel={t("close")}
      >
        {isSheetOpen ? (
          <FormLoadBoundary
            message={tCommon("formLoadError")}
            reloadLabel={tCommon("reloadPage")}
            loadingLabel={tCommon("loading")}
          >
            <ShoppingQuickAdd variant="sheet" onAdded={handleAdded} />
          </FormLoadBoundary>
        ) : null}
      </AddItemPanel>
    </>
  );
}
