import type { ReactNode } from "react";
import { Surface } from "@/shared/ui/Surface";

interface FormSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function FormSurface({ children, className = "" }: FormSurfaceProps) {
  return <Surface className={`p-4 ${className}`}>{children}</Surface>;
}
