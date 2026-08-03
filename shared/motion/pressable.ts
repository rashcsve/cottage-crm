import { EASE_BEZIER } from "./easing";

export function pressable(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {};
  }

  return {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.3, ease: EASE_BEZIER },
  };
}