"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";
import { FieldLabel } from "@/shared/ui/FieldLabel";

export function SignupForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const t = useTranslations("auth.signup");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(t("error"));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div>
        <FieldLabel htmlFor="signup-display-name">
          {t("fields.displayName")}
        </FieldLabel>
        <input
          id="signup-display-name"
          name="displayName"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="name"
          aria-describedby={errorMessage ? "signup-form-error" : undefined}
        />
      </div>

      <div>
        <FieldLabel htmlFor="signup-email">{t("fields.email")}</FieldLabel>
        <input
          id="signup-email"
          name="email"
          type="email"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={errorMessage ? "signup-form-error" : undefined}
        />
      </div>

      <div>
        <FieldLabel htmlFor="signup-password">
          {t("fields.password")}
        </FieldLabel>
        <input
          id="signup-password"
          name="password"
          type="password"
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={errorMessage ? "signup-form-error" : undefined}
        />
      </div>

      {errorMessage && (
        <div
          id="signup-form-error"
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-stone-800 px-5 py-3 font-medium text-white disabled:opacity-60 cursor-pointer"
      >
        {isSaving ? t("submitting") : t("submit")}
      </button>

      <div className="pt-2 text-sm text-stone-600">
        {t("switchPrompt")}{" "}
        <Link
          href="/login"
          className="font-medium text-stone-800 underline underline-offset-4 transition hover:text-stone-600"
        >
          {t("switchAction")}
        </Link>
      </div>
    </form>
  );
}
