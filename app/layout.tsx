import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#F5F6F3",
  viewportFit: "cover",
};

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const splineSansMono = Spline_Sans_Mono({
  variable: "--font-spline-sans-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${schibstedGrotesk.variable} ${splineSansMono.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
