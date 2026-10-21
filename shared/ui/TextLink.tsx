import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

interface TextLinkProps extends ComponentProps<typeof Link> {
  children: ReactNode;
}

export function TextLink({ children, className = "", ...props }: TextLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent transition-colors hover:text-accent-hover ${className}`.trim()}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  );
}
