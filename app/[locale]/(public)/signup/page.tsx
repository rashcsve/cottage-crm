import { AppShell } from "@/app/[locale]/components/AppShell";
import { SignupForm } from "@/app/[locale]/components/auth/SignupForm";
import { getTranslations } from "next-intl/server";

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

  return (
    <AppShell title={t("pageTitle")}>
      <SignupForm />
    </AppShell>
  );
}
