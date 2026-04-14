import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { Toaster } from "react-hot-toast";
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { Suspense } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL('https://commerce.lk'),
  title: {
    template: '%s | Commerce.lk',
    default: 'Commerce.lk - Free A/L Commerce Study Materials',
  },
  description: 'Free A/L Commerce study materials for Sri Lankan students. Download past papers, model papers, short notes and more.',
  keywords: ['A/L Commerce', 'Sri Lanka', 'past papers', 'model papers', 'accounting', 'business studies', 'economics', 'ICT'],
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: 'https://commerce.lk',
    siteName: 'Commerce.lk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Commerce.lk',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@commercelk',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Commerce.lk",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body suppressHydrationWarning className="bg-white antialiased">
        <SessionProvider>
          {children}
          <PWAProvider />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#111827",
                border: "1px solid #E5E7EB",
                borderRadius: "16px",
                padding: "16px",
                fontSize: "14px",
                fontWeight: "600",
              },
            }}
          />
        </SessionProvider>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      </body>
    </html>
  );
}
