import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/[locale]/globals.css";
import { ToastProvider } from "@/shared/Toast/ToastProvider";
import { ReactNode } from "react";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chata CRM",
  description: "Rodinná správa chaty",
};

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-stone-100 text-stone-900 antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
