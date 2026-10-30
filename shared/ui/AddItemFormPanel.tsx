"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { AddItemPanel } from "./AddItemPanel";
import { FormLoadBoundary } from "./Form/FormLoadBoundary";

interface AddItemFormPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  closeLabel: string;
  children: ReactNode;
}

export function AddItemFormPanel({
  open,
  onClose,
  title,
  titleId,
  closeLabel,
  children,
}: AddItemFormPanelProps) {
  const t = useTranslations("common");

  return (
    <AddItemPanel
      open={open}
      onClose={onClose}
      title={title}
      titleId={titleId}
      closeLabel={closeLabel}
    >
      {open ? (
        <FormLoadBoundary
          message={t("formLoadError")}
          reloadLabel={t("reloadPage")}
          loadingLabel={t("loading")}
        >
          {children}
        </FormLoadBoundary>
      ) : null}
    </AddItemPanel>
  );
}
