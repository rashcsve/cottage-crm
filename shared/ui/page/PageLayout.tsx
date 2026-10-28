import type { ReactNode } from "react";

import { PageContent, type PageContentSize } from "./PageContent";
import { PageHeader } from "./PageHeader";

interface PageLayoutProps {
  children: ReactNode;
  size?: PageContentSize;
  title: string;
}

export function PageLayout({
  children,
  size = "default",
  title,
}: PageLayoutProps) {
  return (
    <PageContent size={size}>
      <PageHeader title={title} className="sr-only" />
      {children}
    </PageContent>
  );
}
