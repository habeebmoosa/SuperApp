// "use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import { Providers } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supetron - AI-Powered Micro Apps",
  description: "Create and run AI-powered micro apps using natural language prompts. No coding required.",
  keywords: ["AI apps", "no-code", "micro apps", "automation", "workflow"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
          <Providers>{children}</Providers>
      </body>
    </html>
  );
}
