import type { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return <div className={`max-w-4xl space-y-8 ${className}`}>{children}</div>;
}
