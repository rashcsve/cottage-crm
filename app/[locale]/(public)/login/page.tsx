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

function getInitialError(
  error: string | string[] | undefined,
  t: (key: "errors.oauthFailed" | "errors.cookiesBlocked") => string,
) {
  if (error === "oauth") {
    return t("errors.oauthFailed");
  }

  if (error === "cookies") {
    return t("errors.cookiesBlocked");
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  await redirectIfAuthenticated({ skipDemoAutoLogin: error === "cookies" });
  const t = await getTranslations("auth.login");
  const initialError = getInitialError(error, t);

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
