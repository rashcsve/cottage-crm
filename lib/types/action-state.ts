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
