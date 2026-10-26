import { PublicShell } from "@/app/[locale]/components/PublicShell";
import { AuthSheet } from "@/app/[locale]/components/auth/AuthSheet";
import { LoginForm } from "@/app/[locale]/components/auth/LoginForm";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("auth.login");

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated();
  const t = await getTranslations("auth.login");
  const { error } = await searchParams;
  const initialError = error === "oauth" ? t("errors.oauthFailed") : undefined;

  return (
    <PublicShell currentPath="/login" contentVariant="auth">
      <AuthSheet
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      >
        <LoginForm initialError={initialError} />
      </AuthSheet>
    </PublicShell>
  );
}
