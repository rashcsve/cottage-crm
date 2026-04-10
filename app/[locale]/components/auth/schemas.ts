import { z } from "zod";

export interface LoginSchemaMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}

export interface SignupSchemaMessages extends LoginSchemaMessages {
  displayNameRequired: string;
  displayNameMin: string;
  displayNameMax: string;
  passwordMin: string;
}

export function createLoginSchema(messages: LoginSchemaMessages) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z.string().min(1, messages.passwordRequired),
  });
}

export function createSignupSchema(messages: SignupSchemaMessages) {
  return z.object({
    displayName: z
      .string()
      .trim()
      .min(1, messages.displayNameRequired)
      .min(2, messages.displayNameMin)
      .max(80, messages.displayNameMax),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMin),
  });
}

type LoginSchemaType = ReturnType<typeof createLoginSchema>;
type SignupSchemaType = ReturnType<typeof createSignupSchema>;

export type LoginFormInput = z.input<LoginSchemaType>;
export type LoginFormData = z.output<LoginSchemaType>;
export type SignupFormInput = z.input<SignupSchemaType>;
export type SignupFormData = z.output<SignupSchemaType>;
