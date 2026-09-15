export interface LoginErrorMessages {
  invalidCredentials: string;
  emailNotConfirmed: string;
  rateLimited: string;
  unexpected: string;
}

export function mapLoginErrorMessage(
  code: string | undefined,
  messages: LoginErrorMessages,
): string {
  switch (code) {
    case "invalid_credentials":
      return messages.invalidCredentials;
    case "email_not_confirmed":
      return messages.emailNotConfirmed;
    case "over_request_rate_limit":
      return messages.rateLimited;
    default:
      return messages.unexpected;
  }
}

export interface SignupErrorMessages {
  emailAlreadyRegistered: string;
  weakPassword: string;
  rateLimited: string;
  unexpected: string;
}

export function mapSignupErrorMessage(
  code: string | undefined,
  messages: SignupErrorMessages,
): string {
  switch (code) {
    case "user_already_exists":
    case "email_exists":
    case "identity_already_exists":
      return messages.emailAlreadyRegistered;
    case "weak_password":
      return messages.weakPassword;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return messages.rateLimited;
    default:
      return messages.unexpected;
  }
}
