/**
 * Result type for server actions.
 * Used consistently across all features for success/error handling.
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Legacy ActionState - kept for backward compatibility during migration.
 * @deprecated Use ActionResult instead
 */
export type ActionState = {
  ok: boolean;
  message: string;
  error?: string | null;
  fieldErrors?: Record<string, string>;
};
