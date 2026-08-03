import "server-only";

import { isClientDemoModeEnabled } from "@/lib/demo/is-demo-mode";

export function getDemoSessionUrl(locale: string) {
  return `/api/demo/session?locale=${encodeURIComponent(locale)}`;
}

export function getDemoCtaHref(locale: string): string | null {
  return isClientDemoModeEnabled() ? getDemoSessionUrl(locale) : null;
}
