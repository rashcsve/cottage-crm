import { EASE_BEZIER } from "./easing";

interface RevealOnScrollOptions {
  y?: number;
  duration?: number;
  delay?: number;
  margin?: string;
}

export function revealOnScroll(
  prefersReducedMotion: boolean,
  { y = 24, duration = 0.6, delay = 0, margin = "-80px" }: RevealOnScrollOptions = {}
) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin },
    transition: { duration, ease: EASE_BEZIER, delay },
  };
}