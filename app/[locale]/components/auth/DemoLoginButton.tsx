"use client";

import { useRouter } from "@/i18n/navigation";
import { setE2EAuthCookieInBrowser } from "@/lib/e2e/mock-auth";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";
import { Button } from "@/shared/ui/Button";

interface DemoLoginButtonProps {
  label: string;
}

export function DemoLoginButton({ label }: DemoLoginButtonProps) {
  const router = useRouter();

  function handleDemoLogin() {
    setE2EAuthCookieInBrowser();
    router.push(DEFAULT_AUTHENTICATED_ROUTE);
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" className="w-full" onClick={handleDemoLogin}>
      {label}
    </Button>
  );
}
