import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-stone-100 text-stone-900 font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
