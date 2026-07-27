import Script from "next/script";
import { config } from "@/lib/config";

/** GA4 - yalnizca NEXT_PUBLIC_GA_MEASUREMENT_ID tanimliysa yuklenir. */
export function GoogleAnalytics() {
  const id = config.analytics.gaId;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
