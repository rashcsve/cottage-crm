"use client";

import { LogOut } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { signOutAction } from "@/lib/auth/sign-out";

interface AccountMenuProps {
  accountName: string;
  accountInitial: string;
  triggerLabel: string;
  signOutLabel: string;
}

interface AccountMenuContentProps extends AccountMenuProps {
  onSignOut: () => void;
}

function AccountMenuContent({
  accountName,
  accountInitial,
  triggerLabel,
  signOutLabel,
  onSignOut,
}: AccountMenuContentProps) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;
  const headingId = `${id}-heading`;
  const itemId = `${id}-sign-out`;

  useEffect(() => {
    if (!open) return;

    menuRef.current?.focus();

    function closeOutside(event: Event) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
        if (
          event.type === "mousedown" &&
          event.target instanceof Element &&
          !event.target.closest(
            "a[href], area[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not(:disabled), [contenteditable]:not([contenteditable=false]), label[for], summary, iframe, video[controls]",
          )
        ) {
          // Keep a click on plain content from discarding the menu's focus.
          event.preventDefault();
          triggerRef.current?.focus();
        }
      }
    }

    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function signOut() {
    if (pending) return;
    closeAndFocusTrigger();
    onSignOut();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-busy={pending}
        aria-disabled={pending || undefined}
        onClick={() => {
          if (pending) return;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            if (pending) return;
            setOpen(true);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " ") event.preventDefault();
        }}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-control aria-disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-control bg-ink-primary text-sm font-semibold text-on-accent lg:size-9"
        >
          {pending ? (
            <LogOut className="size-4 animate-pulse" aria-hidden="true" />
          ) : (
            accountInitial
          )}
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-labelledby={triggerId}
          aria-activedescendant={itemId}
          onKeyDown={(event) => {
            switch (event.key) {
              case "Escape":
                event.preventDefault();
                event.stopPropagation();
                closeAndFocusTrigger();
                break;
              case "Tab":
                closeAndFocusTrigger();
                break;
              case "ArrowDown":
              case "ArrowUp":
              case "Home":
              case "End":
                event.preventDefault();
                break;
              case "Enter":
              case " ":
                event.preventDefault();
                signOut();
                break;
            }
          }}
          className="absolute top-full right-0 z-40 mt-1 w-max max-w-72 min-w-48 rounded-control border border-border bg-surface py-1"
        >
          <div role="group" aria-labelledby={headingId}>
            <div
              id={headingId}
              className="px-4 pt-2 pb-1 text-xs font-semibold break-words text-ink-muted"
            >
              {accountName}
            </div>
            <button
              id={itemId}
              role="menuitem"
              tabIndex={-1}
              type="button"
              disabled={pending}
              onClick={signOut}
              className="flex min-h-11 w-full items-center gap-2 bg-muted px-4 text-left text-sm font-medium text-ink-primary disabled:opacity-60"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              {signOutLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AccountMenu(props: AccountMenuProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function submitAfterMenuCloses() {
    setTimeout(() => formRef.current?.requestSubmit());
  }

  return (
    <form ref={formRef} action={signOutAction}>
      <AccountMenuContent {...props} onSignOut={submitAfterMenuCloses} />
    </form>
  );
}
