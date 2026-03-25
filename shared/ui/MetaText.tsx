import type { ReactNode } from "react";

interface MetaTextProps {
  children: ReactNode;
  className?: string;
}

export function MetaText({ children, className = "" }: MetaTextProps) {
  return <p className={`text-sm text-stone-500 ${className}`}>{children}</p>;
}
