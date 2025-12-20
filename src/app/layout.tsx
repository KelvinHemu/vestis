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
  description: "Transform your fashion photography with AI. Generate stunning flat lays, on-model shots, mannequin images, and more in seconds.",
  keywords: ["AI photography", "fashion photography", "product photography", "e-commerce", "flat lay", "on-model"],
  authors: [{ name: "Vestis" }],
  openGraph: {
    title: "Vestis - AI Fashion Photography",
    description: "Generate professional fashion photography with AI. Flat lays, on-model shots, and more.",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {gaId && <GoogleAnalytics measurementId={gaId} />}
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        {/* Tawk.to Live Chat Widget */}
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/69467abef373c0197fb0af17/1jctkuvch';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
