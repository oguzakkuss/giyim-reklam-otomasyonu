import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="mt-2 text-sm text-neutral-400">Last updated: July 29, 2026</p>

      <p className="mt-6 leading-relaxed text-neutral-600">
        By using {config.site.name}, you agree to these terms. If you do not agree, please
        do not use the site.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Informational content</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Content is provided for general information and shopping discovery. We aim for
        accuracy but do not guarantee that descriptions, prices, availability, or other
        product details are complete or current.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Affiliate links and third parties</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Some links are affiliate links. As an Amazon Associate, we earn from qualifying
        purchases. Purchases are completed with third-party retailers and are subject to
        their terms, privacy policies, shipping, returns, and customer service.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Intellectual property</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Original site text, branding, and design may not be copied or redistributed
        without permission. Third-party product names, images, and trademarks belong to
        their respective owners.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Disclaimer and limitation of liability</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        The site is provided &ldquo;as is&rdquo; without warranties. To the fullest extent
        permitted by law, {config.site.name} is not responsible for losses arising from
        reliance on site content, third-party products, or external websites.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Changes</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        We may update these terms from time to time. Continued use after an update means
        you accept the revised terms.
      </p>
    </div>
  );
}
