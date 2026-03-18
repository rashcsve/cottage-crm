import { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

export function Surface({ children, className }: SurfaceProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
