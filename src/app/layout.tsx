import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { config } from "@/lib/config";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(config.site.url),
  title: {
    default: `${config.site.name} - Curated Fashion Finds`,
    template: `%s | ${config.site.name}`,
  },
  description:
    "Discover curated clothing, accessories, and standout fashion finds in one place.",
  openGraph: {
    siteName: config.site.name,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {config.adsense.enabled && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsense.client}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <GoogleAnalytics />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
