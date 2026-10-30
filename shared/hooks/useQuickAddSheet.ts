"use client";

import { useCallback, useState } from "react";
import type { QuickAddAnnouncement } from "./useQuickAddSubmit";

interface UseQuickAddSheetResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  announcement: QuickAddAnnouncement;
  handleAdded: (title: string) => void;
}

export function useQuickAddSheet(
  getAddedMessage: (title: string) => string,
): UseQuickAddSheetResult {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<QuickAddAnnouncement>({
    id: 0,
    text: "",
  });

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  function handleAdded(title: string) {
    setAnnouncement((previous) => ({
      id: previous.id + 1,
      text: getAddedMessage(title),
    }));
    close();
  }

  return { isOpen, open, close, announcement, handleAdded };
}
