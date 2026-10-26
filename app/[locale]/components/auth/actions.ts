"use server";

import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { isDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import { E2E_AUTH_COOKIE, E2E_AUTH_COOKIE_VALUE } from "@/lib/e2e/mock-auth";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import { createClient } from "@/lib/supabase/server";

import {
  getLoginSchemaMessages,
  getSignupSchemaMessages,
} from "./get-auth-schema-messages";
import {
  createLoginSchema,
  createSignupSchema,
  type LoginFormInput,
  type SignupFormInput,
} from "./schemas";
import { mapLoginErrorMessage, mapSignupErrorMessage } from "./map-supabase-auth-error";
import {
  buildOAuthCallbackUrl,
  buildPostLoginPath,
} from "./build-auth-redirect-url";

type AuthFieldErrors = Partial<
  Record<"displayName" | "email" | "password", string>
>;

type AuthActionResult =
  | {
      ok: true;
      requiresEmailConfirmation?: boolean;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: AuthFieldErrors;
    };

type OAuthStartResult = { ok: true; url: string } | { ok: false; error: string };

function extractFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): AuthFieldErrors | undefined {
  const entries = Object.entries(fieldErrors)
    .map(([field, messages]) => [field, messages?.[0] ?? null] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] != null);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries) as AuthFieldErrors;
}

function getE2EAuthCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
  };
}

export async function loginAction(
  input: LoginFormInput,
): Promise<AuthActionResult> {
  const t = await getTranslations("auth.login");
  const schema = createLoginSchema(getLoginSchemaMessages(t));
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidCredentials"),
      fieldErrors: extractFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  if (isE2EMockModeEnabled()) {
    const cookieStore = await cookies();

    cookieStore.set(
      E2E_AUTH_COOKIE,
      E2E_AUTH_COOKIE_VALUE,
      getE2EAuthCookieOptions(),
    );

    return { ok: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      console.error("[loginAction] Supabase sign-in failed:", error);
      return {
        ok: false,
        error: mapLoginErrorMessage(error.code, {
          invalidCredentials: t("errors.invalidCredentials"),
          emailNotConfirmed: t("errors.emailNotConfirmed"),
          rateLimited: t("errors.rateLimited"),
          unexpected: t("errors.unexpected"),
        }),
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[loginAction] Unexpected sign-in error:", error);
    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}

export async function signupAction(
  input: SignupFormInput,
): Promise<AuthActionResult> {
  const t = await getTranslations("auth.signup");
  const schema = createSignupSchema(getSignupSchemaMessages(t));
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.failed"),
      fieldErrors: extractFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  if (isE2EMockModeEnabled()) {
    return {
      ok: true,
      requiresEmailConfirmation: true,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          display_name: parsed.data.displayName,
        },
      },
    });

    if (error) {
      console.error("[signupAction] Supabase sign-up failed:", error);
      return {
        ok: false,
        error: mapSignupErrorMessage(error.code, {
          emailAlreadyRegistered: t("errors.emailAlreadyRegistered"),
          weakPassword: t("errors.weakPassword"),
          rateLimited: t("errors.rateLimited"),
          unexpected: t("errors.unexpected"),
        }),
      };
    }

    return {
      ok: true,
      requiresEmailConfirmation: !data.session,
    };
  } catch (error) {
    console.error("[signupAction] Unexpected sign-up error:", error);
    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}

export async function googleSignInAction(
  locale: string,
): Promise<OAuthStartResult> {
  const t = await getTranslations("auth.login");
  const unexpected: OAuthStartResult = {
    ok: false,
    error: t("errors.unexpected"),
  };

  if (isDemoModeEnabled()) {
    return unexpected;
  }

  if (isE2EMockModeEnabled()) {
    const cookieStore = await cookies();

    cookieStore.set(
      E2E_AUTH_COOKIE,
      E2E_AUTH_COOKIE_VALUE,
      getE2EAuthCookieOptions(),
    );

    return { ok: true, url: buildPostLoginPath(locale) };
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL || (await headers()).get("origin");

  if (!origin) {
    console.error(
      "[googleSignInAction] Missing NEXT_PUBLIC_APP_URL and Origin header",
    );
    return unexpected;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: buildOAuthCallbackUrl(origin, locale) },
    });

    if (error || !data.url) {
      console.error("[googleSignInAction] Supabase OAuth start failed:", error);
      return unexpected;
    }

    return { ok: true, url: data.url };
  } catch (error) {
    console.error("[googleSignInAction] Unexpected OAuth start error:", error);
    return unexpected;
  }
}
