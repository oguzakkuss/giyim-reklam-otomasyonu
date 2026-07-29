import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-3xl font-bold">About {config.site.name}</h1>
      <p className="mt-6 leading-relaxed text-neutral-600">
        {config.site.name} is an independent fashion discovery site built to make finding
        noteworthy clothing, accessories, and style inspiration simpler.
      </p>
      <p className="mt-4 leading-relaxed text-neutral-600">
        We curate products based on design, usefulness, customer interest, and value. Our
        editorial descriptions are intended to help readers evaluate a product before
        visiting the retailer. We do not manufacture, sell, ship, or provide warranties
        for the products featured on this site.
      </p>

      <h2 className="mt-8 text-xl font-semibold">How we fund the site</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Some links are affiliate links. We may receive a commission if you make a
        qualifying purchase after following one of those links, at no additional cost to
        you. As an Amazon Associate, we earn from qualifying purchases.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Our editorial approach</h2>
      <p className="mt-2 leading-relaxed text-neutral-600">
        Affiliate relationships do not change the price you pay. Product details, prices,
        and availability can change, so always verify the final information on the
        retailer&apos;s website before purchasing.
      </p>
    </div>
  );
}
