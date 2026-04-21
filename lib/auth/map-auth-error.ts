export interface AuthErrorMessages {
  notAuthenticated: string;
  profileNotFound: string;
  forbidden: string;
  unexpected: string;
}

export function mapAuthErrorMessage(
  code: string,
  messages: AuthErrorMessages,
): string {
  switch (code) {
    case "notAuthenticated":
      return messages.notAuthenticated;
    case "profileNotFound":
      return messages.profileNotFound;
    case "forbidden":
      return messages.forbidden;
    default:
      return messages.unexpected;
  }
}
