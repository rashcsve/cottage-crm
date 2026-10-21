import { Check, Loader2 } from "lucide-react";

interface CheckToggleProps {
  checked: boolean;
  label: string;
  pending?: boolean;
  readOnly?: boolean;
  readOnlyStateLabel: string;
  onToggle?: () => void;
}

const BOX_BASE_CLASS =
  "inline-flex h-[22px] w-[22px] items-center justify-center rounded-control border-control transition-colors";

function getBoxClass(checked: boolean, readOnly: boolean): string {
  if (checked) {
    return `${BOX_BASE_CLASS} border-accent bg-accent text-on-accent`;
  }

  return readOnly
    ? `${BOX_BASE_CLASS} border-ink-muted bg-muted`
    : `${BOX_BASE_CLASS} border-ink-primary bg-surface`;
}

function CheckBox({
  checked,
  pending = false,
  readOnly = false,
}: {
  checked: boolean;
  pending?: boolean;
  readOnly?: boolean;
}) {
  return (
    <span className={getBoxClass(checked, readOnly)} aria-hidden="true">
      {pending ? (
        <Loader2
          className={`h-3.5 w-3.5 motion-safe:animate-spin ${checked ? "" : "text-ink-primary"}`.trim()}
        />
      ) : checked ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : null}
    </span>
  );
}

export function CheckToggle({
  checked,
  label,
  pending = false,
  readOnly = false,
  readOnlyStateLabel,
  onToggle,
}: CheckToggleProps) {
  if (readOnly) {
    return (
      <span className="inline-flex h-11 w-11 items-center justify-center">
        <CheckBox checked={checked} readOnly />
        <span className="sr-only">{readOnlyStateLabel}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-label={label}
      aria-busy={pending}
      aria-pressed={checked}
      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-control disabled:cursor-not-allowed"
    >
      <CheckBox checked={checked} pending={pending} />
    </button>
  );
}
