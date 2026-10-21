import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

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
      <Surface padding="default" role={isError ? "alert" : undefined}>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              {isError && (
                <TriangleAlert
                  aria-hidden="true"
                  className="mt-1 size-6 shrink-0 text-danger"
                />
              )}
              <h1 className="text-2xl font-bold tracking-heading text-ink-primary">
                {title}
              </h1>
            </div>
            <p className="max-w-160 text-sm text-ink-secondary">
              {description}
            </p>
          </div>

          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      </Surface>
    </PageContent>
  );
}
