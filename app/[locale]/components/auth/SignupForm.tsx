"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/Button";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
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
  const supabase = getBrowserSupabaseClient();
  const t = useTranslations("auth.signup");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const schema = createSignupSchema(getSignupSchemaMessages(t));

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

    try {
      const { data: signupData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });

      if (error) {
        setError("root", { message: t("errors.failed") });
        return;
      }

      if (signupData.session) {
        router.push(DEFAULT_AUTHENTICATED_ROUTE);
        router.refresh();
        return;
      }

      reset();
      setSuccessMessage(t("successPendingConfirmation"));
    } catch {
      setError("root", { message: t("errors.unexpected") });
    }
  }

  return (
    <FormSurface className="w-full max-w-md p-6 sm:p-7">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {successMessage && <FormMessage type="success" message={successMessage} />}
        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <div className="space-y-1">
          <FieldLabel htmlFor="signup-display-name">
            {t("fields.displayName")}
          </FieldLabel>
          <input
            id="signup-display-name"
            autoComplete="name"
            disabled={isSubmitting}
            aria-invalid={!!errors.displayName}
            aria-describedby={
              errors.displayName ? "signup-display-name-error" : undefined
            }
            className={formInputClass(!!errors.displayName)}
            {...register("displayName")}
          />
          <FieldError
            id="signup-display-name-error"
            message={errors.displayName?.message}
          />
        </div>

        <div className="space-y-1">
          <FieldLabel htmlFor="signup-email">{t("fields.email")}</FieldLabel>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className={formInputClass(!!errors.email)}
            {...register("email")}
          />
          <FieldError id="signup-email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-1">
          <FieldLabel htmlFor="signup-password">
            {t("fields.password")}
          </FieldLabel>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
            className={formInputClass(!!errors.password)}
            {...register("password")}
          />
          <FieldError
            id="signup-password-error"
            message={errors.password?.message}
          />
        </div>

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
