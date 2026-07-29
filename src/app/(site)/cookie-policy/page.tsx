import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiePolicyPage() {
  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="mt-2 text-sm text-neutral-400">Last updated: July 29, 2026</p>

      <p className="mt-6 leading-relaxed text-neutral-600">
        {config.site.name} uses cookies and similar technologies to operate the site,
        understand traffic, and support advertising.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Types of cookies</h2>
      <ul className="mt-3 list-disc space-y-3 pl-5 text-neutral-600">
        <li>
          <strong>Essential cookies:</strong> support core site functions and remember
          privacy choices.
        </li>
        <li>
          <strong>Analytics cookies:</strong> help us understand visits and improve content.
        </li>
        <li>
          <strong>Advertising cookies:</strong> may be used by advertising providers to
          measure and personalize ads where permitted.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Managing cookies</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        You can accept or reject optional cookies through the banner shown on your first
        visit. You can also delete or block cookies through your browser settings. Blocking
        some cookies may affect site features.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Third-party services</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Google Analytics, Google AdSense, Amazon, and other services may set their own
        cookies when enabled or when you follow a link to their websites. Their use of
        cookies is governed by their respective policies.
      </p>
    </div>
  );
}
