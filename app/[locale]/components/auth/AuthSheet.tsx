import type { ReactNode } from "react";

import { Surface } from "@/shared/ui/Surface";

interface AuthSheetProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthSheet({
  eyebrow,
  title,
  description,
  children,
}: AuthSheetProps) {
  return (
    <Surface className="mx-auto w-full max-w-md p-6 sm:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold text-ink-muted">{eyebrow}</p>
        <h1 className="text-display font-bold tracking-display text-ink-primary [--text-display:2.5rem]">
          {title}
        </h1>
        <p className="text-base text-ink-secondary">{description}</p>
      </header>

      <div className="mt-8">{children}</div>
    </Surface>
  );
}
