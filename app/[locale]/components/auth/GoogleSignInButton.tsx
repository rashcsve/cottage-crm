"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { googleSignInAction } from "./actions";

export function GoogleSignInButton() {
  const locale = useLocale();
  const t = useTranslations("auth.oauth");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsPending(true);

    let result: Awaited<ReturnType<typeof googleSignInAction>>;

    try {
      result = await googleSignInAction(locale);
    } catch {
      setError(t("failed"));
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
        <Image
          src="/google-g.svg"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 shrink-0"
        />
        {isPending ? t("redirecting") : t("google")}
      </Button>

      {error && <FormMessage type="error" message={error} />}
    </div>
  );
}
