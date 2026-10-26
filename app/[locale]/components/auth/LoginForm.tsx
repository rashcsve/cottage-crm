"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { isClientDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { TextLink } from "@/shared/ui/TextLink";
import { loginAction } from "./actions";
import { AuthDivider } from "./AuthDivider";
import { GoogleSignInButton } from "./GoogleSignInButton";
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

interface LoginFormProps {
  initialError?: string;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const schema = useMemo(() => createLoginSchema(getLoginSchemaMessages(t)), [t]);

  const serverErrors = useMemo(
    () =>
      initialError
        ? { root: { type: "server", message: initialError } }
        : undefined,
    [initialError]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
  } = useForm<LoginFormInput, undefined, LoginFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
    errors: serverErrors,
  });

  async function onSubmit(data: LoginFormData) {
    clearErrors("root");

    const result = await loginAction(data);

    if (!result.ok) {
      if (result.fieldErrors?.email) {
        setError("email", { message: result.fieldErrors.email });
      }

      if (result.fieldErrors?.password) {
        setError("password", { message: result.fieldErrors.password });
      }

      reset({ email: data.email, password: "" });
      setError("root", { message: result.error });
      return;
    }

    router.push(DEFAULT_AUTHENTICATED_ROUTE);
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
          id="login-email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          required
          label={t("fields.email")}
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          id="login-password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          required
          label={t("fields.password")}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full min-h-12">
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>

        <p className="flex flex-wrap items-center gap-x-2 border-t border-border pt-3 text-sm text-ink-secondary">
          {t("switchPrompt")}
          <TextLink href={publicRoutes.signup}>{t("switchAction")}</TextLink>
        </p>
      </form>
    </div>
  );
}
