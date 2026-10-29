import type { ReactNode } from "react";

const BAR_CLASS =
  "fixed inset-x-0 bottom-(--mobile-nav-height,0px) z-20 border-t border-border bg-surface lg:hidden";
const BAR_STYLE = {
  paddingLeft: "var(--safe-area-left)",
  paddingRight: "var(--safe-area-right)",
};

interface MobileActionBarProps {
  children: ReactNode;
}

export function MobileActionBar({ children }: MobileActionBarProps) {
  return (
    <>
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className={BAR_CLASS} style={BAR_STYLE}>
        <div className="mx-auto max-w-page px-5 py-3">{children}</div>
      </div>
    </>
  );
}
