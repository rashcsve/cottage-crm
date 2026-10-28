"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "./Button";
import { IconButton } from "./IconButton";

interface AddItemPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  closeLabel: string;
  modal?: boolean;
  isDirty?: boolean;
  discard: { message: string; confirmLabel: string; cancelLabel: string };
  children: ReactNode;
}

const FooterSlotContext = createContext<HTMLElement | null | undefined>(
  undefined,
);

export function AddItemPanelFooter({ children }: { children: ReactNode }) {
  const slot = useContext(FooterSlotContext);

  if (slot === undefined) return <>{children}</>;
  if (slot === null) return null;

  return createPortal(children, slot);
}

const DESKTOP_QUERY = "(min-width: 64rem)";

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const DIALOG_CLASS = [
  "fixed inset-x-0 top-auto bottom-0 z-20 m-0 w-full max-w-none max-h-[90dvh] p-0",
  "rounded-t-card bg-surface text-ink-primary backdrop:bg-scrim",
  "lg:inset-y-auto lg:top-18 lg:right-0 lg:left-auto lg:h-[calc(100dvh-4.5rem)] lg:max-h-none lg:w-[28rem]",
  "lg:rounded-none lg:border-l lg:border-border",
  "motion-safe:transition-transform motion-safe:duration-200 motion-safe:starting:translate-y-full",
  "lg:motion-safe:starting:translate-x-full lg:motion-safe:starting:translate-y-0",
].join(" ");

export function AddItemPanel({
  open,
  onClose,
  title,
  titleId,
  closeLabel,
  modal = true,
  isDirty = false,
  discard,
  children,
}: AddItemPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const isModalRef = useRef(true);
  const wasOpenRef = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null);
  const discardMessageId = useId();

  if (open !== prevOpen) {
    setPrevOpen(open);
    setConfirming(false);
  }

  const focusFirstField = useCallback(() => {
    const target =
      bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      dialogRef.current;
    target?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      wasOpenRef.current = true;
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      isModalRef.current = modal || !window.matchMedia(DESKTOP_QUERY).matches;

      if (isModalRef.current) {
        dialog.showModal();
      } else {
        dialog.show();
      }

      focusFirstField();
    }

    if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
      const active = document.activeElement;
      const focusWasInPanel =
        active === null || active === document.body || dialog.contains(active);

      if (dialog.open) dialog.close();
      const opener = openerRef.current;
      openerRef.current = null;

      if (focusWasInPanel && opener?.isConnected) opener.focus();
    }
  }, [open, modal, focusFirstField]);

  const showConfirm = confirming && isDirty;

  useEffect(() => {
    if (showConfirm) confirmRef.current?.querySelector("button")?.focus();
  }, [showConfirm]);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirming(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, requestClose]);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (open && isModalRef.current) requestClose();
  };

  const handleNativeClose = () => {
    if (open) onClose();
  };

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && isModalRef.current) {
      requestClose();
    }
  };

  const keepEditing = () => {
    setConfirming(false);
    focusFirstField();
  };

  const confirmDiscard = () => {
    setConfirming(false);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      className={DIALOG_CLASS}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onClick={handleClick}
    >
      <div className="group/panel flex max-h-[inherit] flex-col lg:h-full">
        <div className="flex items-center justify-between gap-4 border-b border-border py-2 pr-2 pl-5">
          <h2 id={titleId} className="text-lg font-semibold tracking-heading">
            {title}
          </h2>
          <IconButton
            type="button"
            aria-label={closeLabel}
            onClick={requestClose}
          >
            <X aria-hidden="true" />
          </IconButton>
        </div>

        {showConfirm && (
          <div
            ref={confirmRef}
            role="group"
            aria-labelledby={discardMessageId}
            className="flex flex-wrap items-center gap-3 border-b border-border bg-muted px-5 py-3"
          >
            <p
              id={discardMessageId}
              role="alert"
              className="mr-auto text-sm font-semibold"
            >
              {discard.message}
            </p>
            <div className="ml-auto flex gap-3">
              <Button type="button" variant="secondary" onClick={keepEditing}>
                {discard.cancelLabel}
              </Button>
              <Button type="button" onClick={confirmDiscard}>
                {discard.confirmLabel}
              </Button>
            </div>
          </div>
        )}

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-[calc(1.5rem+var(--safe-area-bottom))] group-has-[[data-panel-footer]:not(:empty)]/panel:pb-6"
        >
          <FooterSlotContext.Provider value={footerSlot}>
            {children}
          </FooterSlotContext.Provider>
        </div>

        <div
          ref={setFooterSlot}
          data-panel-footer=""
          className="flex justify-end gap-3 border-t border-border px-5 pt-3 pb-[calc(0.75rem+var(--safe-area-bottom))] empty:hidden"
        />
      </div>
    </dialog>
  );
}
