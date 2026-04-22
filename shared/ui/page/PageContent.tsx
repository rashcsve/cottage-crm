import type { ReactNode } from "react";

const PAGE_WIDTHS = {
  default: "max-w-4xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

export type PageContentSize = keyof typeof PAGE_WIDTHS;

interface PageContentProps {
  children: ReactNode;
  className?: string;
  size?: PageContentSize;
}

export function PageContent({
  children,
  className = "",
  size = "default",
}: PageContentProps) {
  return (
    <div
      className={`${PAGE_WIDTHS[size]} space-y-5 sm:space-y-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
