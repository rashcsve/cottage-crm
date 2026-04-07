type MutationErrorCode = "notFound" | "unauthorized" | "databaseError";

export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MutationErrorCode };
