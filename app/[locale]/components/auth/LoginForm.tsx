"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
import {
  createLoginSchema,
  type LoginFormData,
  type LoginFormInput,
} from "./schemas";
import { getLoginSchemaMessages } from "./get-auth-schema-messages";

const defaultValues: LoginFormInput = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const t = useTranslations("auth.login");
  const schema = createLoginSchema(getLoginSchemaMessages(t));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormInput, undefined, LoginFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  async function onSubmit(data: LoginFormData) {
    clearErrors("root");

    try {
      const { error } = await supabase.auth.signInWithPassword(data);

      if (error) {
        setError("root", { message: t("errors.invalidCredentials") });
        return;
      }

      router.push(DEFAULT_AUTHENTICATED_ROUTE);
      router.refresh();
    } catch {
      setError("root", { message: t("errors.unexpected") });
    }
  }

  return (
    <FormSurface className="w-full max-w-md p-6 sm:p-7">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <div className="space-y-1">
          <FieldLabel htmlFor="login-email">{t("fields.email")}</FieldLabel>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={formInputClass(!!errors.email)}
            {...register("email")}
          />
          <FieldError id="login-email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-1">
          <FieldLabel htmlFor="login-password">{t("fields.password")}</FieldLabel>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            className={formInputClass(!!errors.password)}
            {...register("password")}
          />
          <FieldError
            id="login-password-error"
            message={errors.password?.message}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>

        <p className="pt-1 text-sm text-stone-600">
          {t("switchPrompt")}{" "}
          <Link
            href={publicRoutes.signup}
            className="font-medium text-stone-900 underline underline-offset-4 transition hover:text-stone-700"
          >
            {t("switchAction")}
          </Link>
        </p>
      </form>
    </FormSurface>
  );
}
