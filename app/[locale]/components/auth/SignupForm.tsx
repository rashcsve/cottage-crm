"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
import { signupAction } from "./actions";
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

  if (successMessage) {
    return (
      <FormSurface className="w-full max-w-md p-6 sm:p-7">
        <div className="space-y-4">
          <FormMessage type="success" message={successMessage} />
          <p className="pt-1 text-sm text-stone-600">
            {t("switchPrompt")}{" "}
            <Link
              href={publicRoutes.login}
              className="font-medium text-stone-900 underline underline-offset-4 transition hover:text-stone-700"
            >
              {t("switchAction")}
            </Link>
          </p>
        </div>
      </FormSurface>
    );
  }

  return (
    <FormSurface className="w-full max-w-md p-6 sm:p-7">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>

        <p className="pt-1 text-sm text-stone-600">
          {t("switchPrompt")}{" "}
          <Link
            href={publicRoutes.login}
            className="font-medium text-stone-900 underline underline-offset-4 transition hover:text-stone-700"
          >
            {t("switchAction")}
          </Link>
        </p>
      </form>
    </FormSurface>
  );
}
