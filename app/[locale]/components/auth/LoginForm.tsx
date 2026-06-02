"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Form/Field";
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
  const schema = useMemo(() => createLoginSchema(getLoginSchemaMessages(t)), [t]);

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

        <TextField
          id="login-email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          label={t("fields.email")}
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          id="login-password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
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
