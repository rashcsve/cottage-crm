import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

interface WordmarkLinkProps {
  href: ComponentProps<typeof Link>["href"];
  label: string;
  className?: string;
}

export function WordmarkLink({ href, label, className = "" }: WordmarkLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex min-h-11 shrink-0 items-center text-xl font-extrabold tracking-heading text-ink-primary ${className}`.trim()}
    >
      chata<span className="text-accent" aria-hidden="true">.</span>
    </Link>
  );
}
