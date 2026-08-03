"use client";

import { useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useSplitLinesReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      let split: SplitType | null = null;
      let cancelled = false;

      document.fonts.ready.then(() => {
        if (
          cancelled ||
          !el ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;

        split = new SplitType(el, { types: "lines", lineClass: "split-line" });
        if (!split.lines) return;

        gsap.from(split.lines, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { dependencies: [prefersReducedMotion] }
  );

  return ref;
}
