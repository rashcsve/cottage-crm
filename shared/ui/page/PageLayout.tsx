import type { ReactNode } from "react";

import { PageContent, type PageContentSize } from "./PageContent";
import { PageHeader } from "./PageHeader";

interface PageLayoutProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  headerContent?: ReactNode;
  size?: PageContentSize;
  title: string;
}

export function PageLayout({
  actions,
  children,
  className = "",
  description,
  headerContent,
  size = "default",
  title,
}: PageLayoutProps) {
  return (
    <PageContent size={size} className={className}>
      <PageHeader title={title} description={description} actions={actions}>
        {headerContent}
      </PageHeader>
      {children}
    </PageContent>
  );
}
