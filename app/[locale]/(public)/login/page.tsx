import { PublicShell } from "@/app/[locale]/components/PublicShell";
import { LoginForm } from "@/app/[locale]/components/auth/LoginForm";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("auth.login");

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <PublicShell currentPath="/login">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
            {t("pageTitle")}
          </h1>
          <p className="text-base leading-7 text-stone-600">
            {t("pageDescription")}
          </p>
        </div>

        <LoginForm />
      </div>
    </PublicShell>
  );
}
