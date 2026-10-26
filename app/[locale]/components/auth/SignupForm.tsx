"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { isClientDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { TextLink } from "@/shared/ui/TextLink";
import { signupAction } from "./actions";
import { AuthDivider } from "./AuthDivider";
import { GoogleSignInButton } from "./GoogleSignInButton";
import {
  createSignupSchema,
  type SignupFormData,
  type SignupFormInput,
} from "./schemas";
import { getSignupSchemaMessages } from "./get-auth-schema-messages";

const defaultValues: SignupFormInput = {
  displayName: "",
  email: "",
  password: "",
};

export function SignupForm() {
  const router = useRouter();
  const t = useTranslations("auth.signup");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const schema = useMemo(() => createSignupSchema(getSignupSchemaMessages(t)), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<SignupFormInput, undefined, SignupFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  async function onSubmit(data: SignupFormData) {
    clearErrors("root");
    setSuccessMessage(null);

    const result = await signupAction(data);

    if (!result.ok) {
      if (result.fieldErrors?.displayName) {
        setError("displayName", { message: result.fieldErrors.displayName });
      }

      if (result.fieldErrors?.email) {
        setError("email", { message: result.fieldErrors.email });
      }

      if (result.fieldErrors?.password) {
        setError("password", { message: result.fieldErrors.password });
      }

      setError("root", { message: result.error });
      return;
    }

    if (!result.requiresEmailConfirmation) {
      router.push(DEFAULT_AUTHENTICATED_ROUTE);
      return;
    }

    reset();
    setSuccessMessage(t("successPendingConfirmation"));
  }

  const switchPrompt = (
    <p className="flex flex-wrap items-center gap-x-2 border-t border-border pt-3 text-sm text-ink-secondary">
      {t("switchPrompt")}
      <TextLink href={publicRoutes.login}>{t("switchAction")}</TextLink>
    </p>
  );

  if (successMessage) {
    return (
      <div className="space-y-5">
        <FormMessage type="success" message={successMessage} />
        {switchPrompt}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isClientDemoModeEnabled() && (
        <>
          <GoogleSignInButton />
          <AuthDivider />
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <TextField
          id="signup-display-name"
          autoComplete="name"
          disabled={isSubmitting}
          required
          label={t("fields.displayName")}
          error={errors.displayName?.message}
          {...register("displayName")}
        />

        <TextField
          id="signup-email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          required
          label={t("fields.email")}
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          id="signup-password"
          type="password"
          autoComplete="new-password"
          disabled={isSubmitting}
          required
          label={t("fields.password")}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full min-h-12">
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>

        {switchPrompt}
      </form>
    </div>
  );
}
