export type AuthErrorCode =
  | "notAuthenticated"
  | "profileNotFound"
  | "forbidden";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}
