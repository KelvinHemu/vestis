"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import "./globals.css";

/* ============================================
   Root Layout
   Wraps the entire application with:
   - Font configurations (Geist)
   - Global providers (React Query, Auth)
   - Error Boundary for error handling
   ============================================ */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
