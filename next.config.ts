import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
      bodySizeLimit: "20mb",
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
