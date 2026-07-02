import type { HTMLAttributes, ReactNode } from "react";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Surface({ children, className = "", ...props }: SurfaceProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
