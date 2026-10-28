"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface MobileBottomNavProps {
  children: ReactNode;
  style: CSSProperties;
}

export function MobileBottomNav({ children, style }: MobileBottomNavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const shell = nav?.parentElement;
    if (!nav || !shell) return;

    const previousHeight = shell.style.getPropertyValue("--mobile-nav-height");
    function updateHeight() {
      if (!nav || !shell) return;
      shell.style.setProperty("--mobile-nav-height", `${nav.getBoundingClientRect().height}px`);
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav, { box: "border-box" });

    return () => {
      observer.disconnect();
      if (previousHeight) {
        shell.style.setProperty("--mobile-nav-height", previousHeight);
      } else {
        shell.style.removeProperty("--mobile-nav-height");
      }
    };
  }, []);

  return (
    <div
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden"
      style={style}
    >
      {children}
    </div>
  );
}
