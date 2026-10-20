"use client";

import {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
} from "@headlessui/react";
import { LogOut } from "lucide-react";
import { useRef } from "react";
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

  return (
    <Menu as="div" className="relative">
      <MenuButton
        aria-label={triggerLabel}
        aria-busy={pending}
        disabled={pending}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-control disabled:opacity-60"
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
      </MenuButton>

      <MenuItems
        modal={false}
        className="absolute top-full right-0 z-40 mt-1 w-max max-w-72 min-w-48 rounded-control border border-border bg-surface py-1"
      >
        <MenuSection>
          <MenuHeading className="px-4 pt-2 pb-1 text-xs font-semibold break-words text-ink-muted">
            {accountName}
          </MenuHeading>
          <MenuItem
            as="button"
            type="button"
            disabled={pending}
            onClick={onSignOut}
            className="flex min-h-11 w-full items-center gap-2 px-4 text-left text-sm font-medium text-ink-primary data-disabled:opacity-60 data-focus:bg-muted"
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            {signOutLabel}
          </MenuItem>
        </MenuSection>
      </MenuItems>
    </Menu>
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
