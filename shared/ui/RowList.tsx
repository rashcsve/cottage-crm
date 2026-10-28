import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";

interface RowListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export function RowList({ children, className = "", ...props }: RowListProps) {
  return (
    <ul {...props} className={`divide-y divide-border ${className}`.trim()}>
      {children}
    </ul>
  );
}

type RowListItemDensity = "default" | "compact";

interface RowListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  density?: RowListItemDensity;
}

const DENSITY_CLASS: Record<RowListItemDensity, string> = {
  default: "gap-3 py-3",
  compact: "gap-1.5 py-1 sm:gap-3 sm:py-3",
};

interface RowListActionsProps {
  children: ReactNode;
  className?: string;
}

export function RowListActions({ children, className = "" }: RowListActionsProps) {
  return (
    <div
      className={`flex shrink-0 flex-wrap items-center gap-2 transition-opacity [@media(hover:hover)]:absolute [@media(hover:hover)]:inset-y-0 [@media(hover:hover)]:right-0 [@media(hover:hover)]:bg-surface [@media(hover:hover)]:pl-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function RowListItem({
  children,
  className = "",
  density = "default",
  ...props
}: RowListItemProps) {
  return (
    <li
      {...props}
      className={`flex min-h-12 min-w-0 items-center ${DENSITY_CLASS[density]} wrap-break-word ${className}`.trim()}
    >
      {children}
    </li>
  );
}
