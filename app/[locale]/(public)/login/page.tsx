import { PublicShell } from "@/app/[locale]/components/PublicShell";
import { DemoLoginButton } from "@/app/[locale]/components/auth/DemoLoginButton";
import { LoginForm } from "@/app/[locale]/components/auth/LoginForm";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("auth.login");

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  process.env.NEXT_PUBLIC_E2E_MOCKS === "1";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  const tDemo = isDemoMode ? await getTranslations("demo") : null;

  return (
    <PublicShell currentPath="/login" contentVariant="auth">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            {t("eyebrow")}
          </p>
          <h1 className="text-[2.75rem] font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="text-base leading-7 text-stone-600">
            {t("pageDescription")}
          </p>
        </div>

        <LoginForm />

        {tDemo && (
          <div className="space-y-3">
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="shrink-0 text-xs text-stone-400">{tDemo("orLabel")}</span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>
            <DemoLoginButton label={tDemo("loginButton")} />
            <p className="text-center text-xs text-stone-500">{tDemo("loginHint")}</p>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
