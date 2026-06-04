"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signOutAction } from "@/lib/auth/sign-out";

interface DesktopLogoutProps {
  accountInitial: string;
  accountName: string;
  signOutLabel: string;
  ariaLabel: string;
  buttonClass: string;
}

function DesktopLogoutSubmit({
  accountInitial,
  accountName,
  signOutLabel,
  ariaLabel,
  buttonClass,
}: DesktopLogoutProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      aria-busy={pending}
      className={buttonClass}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-900 ring-1 ring-zinc-200 transition group-hover:bg-zinc-200/80">
        {pending ? (
          <LogOut className="h-3.5 w-3.5 animate-pulse text-zinc-400" aria-hidden="true" />
        ) : (
          accountInitial
        )}
      </span>
      <span className="block w-full min-w-0">
        <span className="block truncate text-xs font-semibold text-stone-900">
          {accountName}
        </span>
        <span className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-stone-500 transition group-hover:text-zinc-900">
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{pending ? "…" : signOutLabel}</span>
        </span>
      </span>
    </button>
  );
}

export function DesktopLogoutButton(props: DesktopLogoutProps) {
  return (
    <form action={signOutAction} className="w-full">
      <DesktopLogoutSubmit {...props} />
    </form>
  );
}

interface MobileLogoutProps {
  ariaLabel: string;
  buttonClass: string;
}

function MobileLogoutSubmit({ ariaLabel, buttonClass }: MobileLogoutProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      aria-busy={pending}
      className={buttonClass}
    >
      <LogOut
        className={`h-4 w-4 ${pending ? "animate-pulse opacity-50" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}

export function MobileLogoutButton(props: MobileLogoutProps) {
  return (
    <form action={signOutAction}>
      <MobileLogoutSubmit {...props} />
    </form>
  );
}
