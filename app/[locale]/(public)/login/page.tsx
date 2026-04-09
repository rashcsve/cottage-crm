import { AppShell } from "@/app/[locale]/components/AppShell";
import { LoginForm } from "@/app/[locale]/components/auth/LoginForm";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <AppShell title={t("pageTitle")}>
      <LoginForm />
    </AppShell>
  );
}
