import type { ReactNode } from "react";

import { Surface } from "@/shared/ui/Surface";

import { PageContent, type PageContentSize } from "./PageContent";

interface PageFeedbackProps {
  actions?: ReactNode;
  description: string;
  size?: PageContentSize;
  title: string;
  tone?: "neutral" | "error";
}

export function PageFeedback({
  actions,
  description,
  size = "default",
  title,
  tone = "neutral",
}: PageFeedbackProps) {
  const isError = tone === "error";

  return (
    <PageContent size={size}>
      <Surface
        role={isError ? "alert" : undefined}
        className={
          isError
            ? "border-danger-200 bg-danger-50 p-6 text-danger-900 sm:p-7"
            : "p-6 sm:p-7"
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p
              className={
                isError
                  ? "max-w-2xl text-sm text-danger-700"
                  : "max-w-2xl text-sm text-ink-secondary"
              }
            >
              {description}
            </p>
          </div>

          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      </Surface>
    </PageContent>
  );
}
