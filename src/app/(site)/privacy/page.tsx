import type { Metadata } from "next";
import Link from "next/link";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const email = `info@${new URL(config.site.url).hostname.replace("www.", "")}`;

  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-400">Last updated: July 29, 2026</p>

      <p className="mt-6 leading-relaxed text-neutral-600">
        {config.site.name} respects your privacy. This policy explains what information
        we collect, how we use it, and the choices available to you when you visit our site.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Information we collect</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        We may collect basic usage data such as pages viewed, referring source, browser
        type, device information, and interactions with product links. If you contact us,
        we also receive the information you choose to provide in your message.
      </p>

      <h2 className="mt-8 text-xl font-semibold">How we use information</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        We use information to operate and improve the site, understand which content is
        useful, prevent abuse, respond to inquiries, and measure advertising and affiliate
        performance.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Analytics, advertising, and cookies</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        We may use providers such as Google Analytics and Google AdSense. These providers
        may use cookies or similar technologies to measure traffic and deliver or evaluate
        advertising. Learn more in our{" "}
        <Link href="/cookie-policy" className="text-brand-600 underline">
          Cookie Policy
        </Link>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold">Affiliate links</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Some links are affiliate links. As an Amazon Associate, we earn from qualifying
        purchases. Amazon may collect information under its own privacy policy when you
        leave our site and visit Amazon.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Your privacy choices</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        You can reject optional cookies through our consent banner and control cookies in
        your browser. Depending on your location, you may also have rights to request
        access, correction, deletion, or information about your personal data. We do not
        knowingly sell personal information.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Children&apos;s privacy</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        This site is not directed to children under 13, and we do not knowingly collect
        personal information from children under 13.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        For privacy questions or requests, email us at{" "}
        <a href={`mailto:${email}`} className="text-brand-600 underline">
          {email}
        </a>
        .
      </p>
    </div>
  );
}
