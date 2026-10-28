import { Button } from "@/shared/ui/Button";

interface PendingSubmitButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
}

export function PendingSubmitButton({
  isPending,
  label,
  pendingLabel,
  className,
}: PendingSubmitButtonProps) {
  return (
    <Button type="submit" disabled={isPending} className={className}>
      <span className="grid">
        <span
          aria-hidden={isPending || undefined}
          className={`col-start-1 row-start-1 ${isPending ? "invisible" : ""}`.trim()}
        >
          {label}
        </span>
        <span
          aria-hidden={!isPending || undefined}
          className={`col-start-1 row-start-1 ${isPending ? "" : "invisible"}`.trim()}
        >
          {pendingLabel}
        </span>
      </span>
    </Button>
  );
}
