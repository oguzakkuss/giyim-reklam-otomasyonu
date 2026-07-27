import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { config } from "@/lib/config";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(config.site.url),
  title: {
    default: `${config.site.name} - Gunun One Cikan Giyim Urunleri`,
    template: `%s | ${config.site.name}`,
  },
  description:
    "Trend giyim urunlerini kesfedin. Gunun one cikan parcalarini tek yerde derledik.",
  openGraph: {
    siteName: config.site.name,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
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
