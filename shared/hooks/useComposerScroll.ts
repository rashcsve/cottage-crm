"use client";

import { useEffect, useRef } from "react";

export function useComposerScroll(isOpen: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const prefersReducedMotion =
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frameId = requestAnimationFrame(() => {
      ref.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  return ref;
}
