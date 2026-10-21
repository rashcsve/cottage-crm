import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`rounded-control bg-muted motion-safe:animate-pulse ${className}`.trim()}
    />
  );
}
