"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuickAddSheet } from "@/shared/hooks/useQuickAddSheet";
import { AddItemFormPanel } from "@/shared/ui/AddItemFormPanel";
import { Button } from "@/shared/ui/Button";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";

const TaskAddSheetForm = dynamic(() =>
  import("@/features/tasks/components/forms/TaskAddSheetForm").then(
    (module) => module.TaskAddSheetForm,
  ),
);

const SHEET_TITLE_ID = "task-add-sheet-title";

interface TaskQuickAddBarProps {
  todayIso: string;
  children: (headerTrigger: ReactNode) => ReactNode;
}

export function TaskQuickAddBar({ todayIso, children }: TaskQuickAddBarProps) {
  const t = useTranslations("tasks.quickAdd");
  const sheet = useQuickAddSheet((title) => t("added", { title }));

  function renderTrigger(className: string) {
    return (
      <Button type="button" onClick={sheet.open} className={className}>
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        {t("button")}
      </Button>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        <QuickAddAnnouncer announcement={sheet.announcement} />

        {children(
          <div className="hidden shrink-0 lg:block">{renderTrigger("")}</div>,
        )}
      </div>

      <MobileActionBar>{renderTrigger("w-full min-h-12")}</MobileActionBar>

      <AddItemFormPanel
        open={sheet.isOpen}
        onClose={sheet.close}
        title={t("sheetTitle")}
        titleId={SHEET_TITLE_ID}
        closeLabel={t("close")}
      >
        <TaskAddSheetForm
          todayIso={todayIso}
          onAdded={sheet.handleAdded}
          onCancel={sheet.close}
        />
      </AddItemFormPanel>
    </div>
  );
}
