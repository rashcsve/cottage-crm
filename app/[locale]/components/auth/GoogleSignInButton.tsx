"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { googleSignInAction } from "./actions";
import { GoogleIcon } from "./GoogleIcon";

export function GoogleSignInButton() {
  const locale = useLocale();
  const t = useTranslations("auth.oauth");
  const tLogin = useTranslations("auth.login");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setIsPending(false);
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function handleClick() {
    setError(null);
    setIsPending(true);

    let result: Awaited<ReturnType<typeof googleSignInAction>>;

    try {
      result = await googleSignInAction(locale);
    } catch {
      setError(tLogin("errors.unexpected"));
      setIsPending(false);
      return;
    }

    if (!result.ok) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    window.location.assign(result.url);
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={handleClick}
        className="w-full min-h-12"
      >
        <GoogleIcon />
        {isPending ? t("redirecting") : t("google")}
      </Button>

      {error && <FormMessage type="error" message={error} />}
    </div>
  );
}
