import { PublicShell } from "@/app/[locale]/components/PublicShell";
import { AuthSheet } from "@/app/[locale]/components/auth/AuthSheet";
import { SignupForm } from "@/app/[locale]/components/auth/SignupForm";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("auth.signup");

export default async function SignupPage() {
  await redirectIfAuthenticated();
  const t = await getTranslations("auth.signup");

  return (
    <PublicShell currentPath="/signup" contentVariant="auth">
      <AuthSheet
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescription")}
      >
        <SignupForm />
      </AuthSheet>
    </PublicShell>
  );
}
