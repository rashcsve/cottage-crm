import type { Metadata } from "next";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { DemoBanner } from "@/app/[locale]/components/DemoBanner";
import { ToastProvider } from "@/shared/Toast/ToastProvider";
import {
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/locales";

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  process.env.NEXT_PUBLIC_E2E_MOCKS === "1";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const metadataBase = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined;

  return {
    metadataBase,
    applicationName: t("title"),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
  };
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {isDemoMode && <DemoBanner />}
      <ToastProvider>{children}</ToastProvider>
    </NextIntlClientProvider>
  );
}
