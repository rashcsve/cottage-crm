import type { HTMLAttributes, ReactNode } from "react";

type SurfacePadding = "none" | "default";

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  children: ReactNode;
  className?: string;
  padding?: SurfacePadding;
}

const PADDING_CLASS: Record<SurfacePadding, string> = {
  none: "",
  default: "p-4 lg:p-6",
};

export function Surface({
  as: Tag = "div",
  children,
  className = "",
  padding = "none",
  ...props
}: SurfaceProps) {
  return (
    <Tag
      {...props}
      className={`rounded-card bg-surface ${PADDING_CLASS[padding]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
