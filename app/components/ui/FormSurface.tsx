import type { ReactNode } from "react";
import { Surface } from "@/app/components/ui/Surface";

interface FormSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function FormSurface({ children, className = "" }: FormSurfaceProps) {
  return <Surface className={`p-5 ${className}`}>{children}</Surface>;
}
