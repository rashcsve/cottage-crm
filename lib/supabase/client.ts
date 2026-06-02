import { createBrowserClient } from "@supabase/ssr";

import {
  clearE2EAuthCookieInBrowser,
  setE2EAuthCookieInBrowser,
} from "@/lib/e2e/mock-auth";
import { isClientE2EMockModeEnabled } from "@/lib/e2e/mock-mode";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let client: BrowserSupabaseClient | undefined;

function createE2EMockBrowserClient() {
  return {
    auth: {
      async signInWithPassword() {
        setE2EAuthCookieInBrowser();

        return {
          data: {
            session: {
              access_token: "e2e-access-token",
            },
            user: null,
          },
          error: null,
        };
      },
      async signOut() {
        clearE2EAuthCookieInBrowser();

        return {
          error: null,
        };
      },
      async signUp() {
        return {
          data: {
            session: null,
            user: null,
          },
          error: null,
        };
      },
    },
  } as BrowserSupabaseClient;
}

export function getBrowserSupabaseClient() {
  if (!client) {
    if (isClientE2EMockModeEnabled()) {
      client = createE2EMockBrowserClient();
      return client;
    }

    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return client;
}
