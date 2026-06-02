import type { User } from "@supabase/supabase-js";

import type { Profile } from "@/lib/types/profile";

export const E2E_AUTH_COOKIE_NAME = "codex-e2e-auth";
const E2E_AUTH_COOKIE_VALUE = "active";
const EXPIRED_COOKIE = "Thu, 01 Jan 1970 00:00:00 GMT";

export const E2E_MOCK_USER_EMAIL = "admin@cottage-crm.test";

export const E2E_MOCK_PROFILE: Profile = {
  id: "e2e-admin-user",
  display_name: "E2E Admin",
  role: "admin",
};

export const E2E_MOCK_USER = {
  id: E2E_MOCK_PROFILE.id,
  email: E2E_MOCK_USER_EMAIL,
  role: "authenticated",
  aud: "authenticated",
  app_metadata: {},
  user_metadata: {
    display_name: E2E_MOCK_PROFILE.display_name,
  },
  created_at: "2026-01-05T10:00:00.000Z",
} as User;

export function hasE2EAuthCookie(value: string | null | undefined) {
  return value === E2E_AUTH_COOKIE_VALUE;
}

export function setE2EAuthCookieInBrowser() {
  document.cookie = `${E2E_AUTH_COOKIE_NAME}=${E2E_AUTH_COOKIE_VALUE}; Path=/; SameSite=Lax`;
}

export function clearE2EAuthCookieInBrowser() {
  document.cookie = `${E2E_AUTH_COOKIE_NAME}=; Path=/; Expires=${EXPIRED_COOKIE}; SameSite=Lax`;
}
