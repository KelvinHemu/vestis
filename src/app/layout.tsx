import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import "./globals.css";

/* ============================================
   Root Layout
   Wraps the entire application with:
   - Font configurations (Geist)
   - Global providers (React Query, Auth)
   - Error Boundary for error handling
   - SEO metadata
   ============================================ */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* SEO Metadata */
export const metadata: Metadata = {
  title: "Vestis - AI Fashion Photography",
  description:
    "Transform your fashion photography with AI. Generate stunning flat lays, on-model shots, mannequin images, and more in seconds.",
  keywords: [
    "AI photography",
    "fashion photography",
    "product photography",
    "e-commerce",
    "flat lay",
    "on-model",
  ],
  authors: [{ name: "Vestis" }],
  openGraph: {
    title: "Vestis - AI Fashion Photography",
    description:
      "Generate professional fashion photography with AI. Flat lays, on-model shots, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {gaId && <GoogleAnalytics measurementId={gaId} />}
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
