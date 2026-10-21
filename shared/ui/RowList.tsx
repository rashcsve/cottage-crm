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

interface RowListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

export function RowListItem({
  children,
  className = "",
  ...props
}: RowListItemProps) {
  return (
    <li
      {...props}
      className={`flex min-h-12 min-w-0 items-center gap-3 py-3 wrap-break-word ${className}`.trim()}
    >
      {children}
    </li>
  );
}
