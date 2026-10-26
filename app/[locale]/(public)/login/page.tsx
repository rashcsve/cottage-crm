import { PublicShell } from "@/app/[locale]/components/PublicShell";
import { AuthSheet } from "@/app/[locale]/components/auth/AuthSheet";
import { LoginForm } from "@/app/[locale]/components/auth/LoginForm";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("auth.login");

export default async function LoginPage() {
  await redirectIfAuthenticated();
  const t = await getTranslations("auth.login");

  return (
    <PublicShell currentPath="/login" contentVariant="auth">
      <AuthSheet
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      >
        <LoginForm />
      </AuthSheet>
    </PublicShell>
  );
}
