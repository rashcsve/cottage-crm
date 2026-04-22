import type { HTMLAttributes, ReactNode } from "react";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Surface({ children, className = "", ...props }: SurfaceProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
