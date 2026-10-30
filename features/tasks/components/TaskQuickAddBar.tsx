"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { QuickAddBar } from "@/shared/ui/QuickAddBar";

const TaskAddSheetForm = dynamic(() =>
  import("@/features/tasks/components/forms/TaskAddSheetForm").then(
    (module) => module.TaskAddSheetForm,
  ),
);

const SHEET_TITLE_ID = "task-add-sheet-title";

interface TaskQuickAddBarProps {
  todayIso: string;
  showControls?: boolean;
  children: (headerTrigger: ReactNode) => ReactNode;
}

export function TaskQuickAddBar({
  todayIso,
  showControls,
  children,
}: TaskQuickAddBarProps) {
  const t = useTranslations("tasks.quickAdd");

  return (
    <QuickAddBar
      showControls={showControls}
      labels={{
        button: t("button"),
        sheetTitle: t("sheetTitle"),
        close: t("close"),
      }}
      titleId={SHEET_TITLE_ID}
      getAddedMessage={(title) => t("added", { title })}
      renderForm={({ onAdded, onCancel }) => (
        <TaskAddSheetForm
          todayIso={todayIso}
          onAdded={onAdded}
          onCancel={onCancel}
        />
      )}
    >
      {children}
    </QuickAddBar>
  );
}
