"use client";

import { useEffect, useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

interface RevealOnScrollOptions {
  margin?: string;
}

export function useRevealOnScroll<T extends HTMLElement>({
  margin = "-80px",
}: RevealOnScrollOptions = {}): RefObject<T | null> {
  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      return;
    }
    if (element.dataset.reveal === "shown" || isInViewport(element)) return;

    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: margin }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [margin, prefersReducedMotion]);

  return ref;
}

function isInViewport(element: HTMLElement) {
  const { top, bottom } = element.getBoundingClientRect();
  return top < window.innerHeight && bottom > 0;
}
