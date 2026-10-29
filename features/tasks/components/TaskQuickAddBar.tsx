"use client";

import { useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { QuickAddAnnouncement } from "@/shared/hooks/useQuickAddSubmit";
import { AddItemPanel } from "@/shared/ui/AddItemPanel";
import { Button } from "@/shared/ui/Button";
import { FormLoadBoundary } from "@/shared/ui/Form/FormLoadBoundary";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";

const TaskAddSheetForm = dynamic(() =>
  import("@/features/tasks/components/forms/TaskAddSheetForm").then(
    (module) => module.TaskAddSheetForm,
  ),
);

const SHEET_TITLE_ID = "task-add-sheet-title";

const PINNED_BAR_CLASS =
  "fixed inset-x-0 bottom-(--mobile-nav-height,0px) z-20 border-t border-border bg-surface lg:hidden";
const PINNED_BAR_STYLE = {
  paddingLeft: "var(--safe-area-left)",
  paddingRight: "var(--safe-area-right)",
};

interface TaskQuickAddBarProps {
  todayIso: string;
  children: (headerTrigger: ReactNode) => ReactNode;
}

export function TaskQuickAddBar({ todayIso, children }: TaskQuickAddBarProps) {
  const t = useTranslations("tasks.quickAdd");
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

  function renderTrigger(className: string) {
    return (
      <Button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className={className}
      >
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        {t("button")}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <QuickAddAnnouncer announcement={announcement} />

      <div className="pb-20 lg:pb-0">
        {children(
          <div className="hidden shrink-0 lg:block">{renderTrigger("")}</div>,
        )}
      </div>

      <div className={PINNED_BAR_CLASS} style={PINNED_BAR_STYLE}>
        <div className="mx-auto max-w-page px-5 py-3">
          {renderTrigger("w-full min-h-12")}
        </div>
      </div>

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
            <TaskAddSheetForm
              todayIso={todayIso}
              onAdded={handleAdded}
              onCancel={closeSheet}
            />
          </FormLoadBoundary>
        ) : null}
      </AddItemPanel>
    </div>
  );
}
