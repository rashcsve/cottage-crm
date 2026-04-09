/**
 * Result type for server actions.
 * Used consistently across all features for success/error handling.
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
