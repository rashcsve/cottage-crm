import type { ReactNode } from "react";

interface InlineActionsProps {
  children: ReactNode;
  className?: string;
}

export function InlineActions({
  children,
  className = "",
}: InlineActionsProps) {
  return (
    <div className={`mt-3 flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}
