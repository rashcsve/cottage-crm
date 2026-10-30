import { isClientDemoModeEnabled } from "@/lib/demo/is-demo-mode";

export function getDemoSessionUrl(locale: string, next?: string) {
  const url = `/api/demo/session?locale=${encodeURIComponent(locale)}`;

  return next === undefined ? url : `${url}&next=${encodeURIComponent(next)}`;
}

export function getDemoCtaHref(locale: string): string | null {
  return isClientDemoModeEnabled() ? getDemoSessionUrl(locale) : null;
}
