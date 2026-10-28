type MutationErrorCode = "notFound" | "unauthorized" | "conflict" | "databaseError";

export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MutationErrorCode };
