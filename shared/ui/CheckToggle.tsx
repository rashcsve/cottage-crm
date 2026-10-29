import { Check, Loader2 } from "lucide-react";

type CheckToggleSize = "default" | "large";

interface CheckToggleProps {
  checked: boolean;
  label: string;
  pending?: boolean;
  readOnly?: boolean;
  readOnlyStateLabel: string;
  size?: CheckToggleSize;
  onToggle?: () => void;
}

const BOX_BASE_CLASS =
  "inline-flex items-center justify-center border-control transition-colors";

const BOX_SIZE_CLASS: Record<CheckToggleSize, string> = {
  default: "h-[22px] w-[22px] rounded-control",
  large: "h-6 w-6 rounded-full",
};

const ICON_SIZE_CLASS: Record<CheckToggleSize, string> = {
  default: "h-3.5 w-3.5",
  large: "h-3.5 w-3.5",
};

const TARGET_SHAPE_CLASS: Record<CheckToggleSize, string> = {
  default: "rounded-control",
  large: "rounded-full",
};

function getBoxClass(
  checked: boolean,
  readOnly: boolean,
  size: CheckToggleSize,
): string {
  const base = `${BOX_BASE_CLASS} ${BOX_SIZE_CLASS[size]}`;

  if (checked) {
    return `${base} border-accent bg-accent text-on-accent`;
  }

  return readOnly
    ? `${base} border-ink-muted bg-muted`
    : `${base} border-ink-primary bg-surface`;
}

function CheckBox({
  checked,
  pending = false,
  readOnly = false,
  size,
}: {
  checked: boolean;
  pending?: boolean;
  readOnly?: boolean;
  size: CheckToggleSize;
}) {
  const iconSizeClass = ICON_SIZE_CLASS[size];

  return (
    <span className={getBoxClass(checked, readOnly, size)} aria-hidden="true">
      {pending ? (
        <Loader2
          className={`${iconSizeClass} motion-safe:animate-spin ${checked ? "" : "text-ink-primary"}`.trim()}
        />
      ) : checked ? (
        <Check className={iconSizeClass} strokeWidth={2.5} />
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
  size = "default",
  onToggle,
}: CheckToggleProps) {
  if (readOnly) {
    return (
      <span className="inline-flex h-11 w-11 items-center justify-center">
        <CheckBox checked={checked} readOnly size={size} />
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
      className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center ${TARGET_SHAPE_CLASS[size]} disabled:cursor-not-allowed`}
    >
      <CheckBox checked={checked} pending={pending} size={size} />
    </button>
  );
}
