import type { ReactNode } from "react";
import { Surface } from "./Surface";

interface ListRowProps {
  children: ReactNode;
  className?: string;
}

export function ListRow({ children, className = "" }: ListRowProps) {
  return <Surface className={`px-4 py-3 ${className}`}>{children}</Surface>;
}
