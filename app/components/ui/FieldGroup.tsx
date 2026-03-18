import type { ReactNode } from "react";

interface FieldGroupProps {
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ children, className = "" }: FieldGroupProps) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}
