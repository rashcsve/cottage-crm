"use client";

import { useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { QuickAddAnnouncement } from "@/shared/hooks/useQuickAddSubmit";
import { AddItemPanel } from "@/shared/ui/AddItemPanel";
import { FormLoadBoundary } from "@/shared/ui/Form/FormLoadBoundary";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";

const TaskAddSheetForm = dynamic(() =>
  import("@/features/tasks/components/forms/TaskAddSheetForm").then(
    (module) => module.TaskAddSheetForm,
  ),
);

const SHEET_TITLE_ID = "task-add-sheet-title";

const BAR_CLASS =
  "flex min-h-12 w-full items-center gap-2 rounded-control border-control border-border bg-surface py-1.5 pr-1.5 pl-3.5 text-left text-base text-ink-muted transition-colors hover:border-ink-primary";
const BAR_ADD_CLASS =
  "ml-auto inline-flex min-h-9 shrink-0 items-center rounded-control bg-accent px-4 text-sm font-semibold text-on-accent";
// MobileBottomNav's measured height includes the bottom safe-area inset.
const PINNED_BAR_CLASS =
  "fixed inset-x-0 bottom-(--mobile-nav-height,0px) z-20 border-t border-border bg-surface lg:hidden";
const PINNED_BAR_STYLE = {
  paddingLeft: "var(--safe-area-left)",
  paddingRight: "var(--safe-area-right)",
};

interface TaskQuickAddBarProps {
  todayIso: string;
  children: ReactNode;
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

  const bar = (
    <button
      type="button"
      onClick={() => setIsSheetOpen(true)}
      className={BAR_CLASS}
    >
      <Plus className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{t("barLabel")}</span>
      <span className={BAR_ADD_CLASS}>{t("submit")}</span>
    </button>
  );

  return (
    <div className="space-y-2">
      <QuickAddAnnouncer announcement={announcement} />

      <div className="hidden lg:block">{bar}</div>

      <div className="pb-20 lg:pb-0">{children}</div>

      <div className={PINNED_BAR_CLASS} style={PINNED_BAR_STYLE}>
        <div className="mx-auto max-w-page px-5 py-3">{bar}</div>
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
            <TaskAddSheetForm todayIso={todayIso} onAdded={handleAdded} />
          </FormLoadBoundary>
        ) : null}
      </AddItemPanel>
    </div>
  );
}
