import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { SERVER_ACTION_BODY_SIZE_LIMIT_BYTES } from "./features/notes/shared/notePhotoValidation";

const withNextIntl = createNextIntlPlugin("./i18n/config.ts");

function getSupabaseHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: SERVER_ACTION_BODY_SIZE_LIMIT_BYTES,
    },
  },
  images: supabaseHostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHostname,
          },
        ],
      }
    : {},
};

export default withNextIntl(nextConfig);
