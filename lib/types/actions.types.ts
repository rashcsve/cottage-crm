export type ActionState = {
  ok: boolean;
  message: string;
  error?: string | null;
};

export const initialActionState: ActionState = {
  ok: false,
  message: "",
  error: "",
};

export type ActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
