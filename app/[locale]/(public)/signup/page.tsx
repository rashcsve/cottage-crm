import { PublicShell } from "@/app/[locale]/components/PublicShell";
import { SignupForm } from "@/app/[locale]/components/auth/SignupForm";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("auth.signup");

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

  return (
    <PublicShell currentPath="/signup">
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

        <SignupForm />
      </div>
    </PublicShell>
  );
}
