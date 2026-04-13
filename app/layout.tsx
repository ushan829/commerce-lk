import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://commerce.lk"
  ),
  title: {
    default: "Commerce.lk | A/L Commerce Study Materials - Past Papers, Model Papers & Notes",
    template: "%s | Commerce.lk",
  },
  description:
    "Sri Lanka's #1 platform for A/L Commerce study materials. Download free Past Papers, Model Papers, Short Notes, Marking Schemes, and Term Test Papers for Accounting, Business Studies, Economics, Business Statistics, ICT, and more.",
  keywords: [
    "A/L commerce",
    "past papers",
    "model papers",
    "accounting",
    "business studies",
    "economics",
    "Sri Lanka",
    "sinhala medium",
    "tamil medium",
  ],
  authors: [{ name: "Commerce.lk" }],
  creator: "Commerce.lk",
  publisher: "Commerce.lk",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Commerce.lk",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://commerce.lk",
    siteName: "Commerce.lk",
    title: "Commerce.lk | A/L Commerce Study Materials",
    description:
      "Sri Lanka's #1 platform for A/L Commerce study materials. Free Past Papers, Model Papers, Short Notes, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Commerce.lk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commerce.lk | A/L Commerce Study Materials",
    description: "Sri Lanka's #1 platform for A/L Commerce study materials.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://commerce.lk",
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
      </body>
    </html>
  );
}
