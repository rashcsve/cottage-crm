import { EASE_BEZIER } from "./easing";

interface FadeInOptions {
  y?: number;
  duration?: number;
  delay?: number;
}

export function fadeIn(
  prefersReducedMotion: boolean,
  { y = 24, duration = 0.6, delay = 0 }: FadeInOptions = {}
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
    animate: { opacity: 1, y: 0 },
    transition: { duration, ease: EASE_BEZIER, delay },
  };
}