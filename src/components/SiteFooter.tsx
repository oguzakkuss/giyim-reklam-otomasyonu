import Link from "next/link";
import { config } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="container-max grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <div className="text-lg font-bold">{config.site.name}</div>
          <p className="mt-2 max-w-xs text-sm text-neutral-500">
            Curated fashion finds, style inspiration, and products worth discovering.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-800">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li><Link href="/" className="hover:text-brand-600">Home</Link></li>
            <li><Link href="/about" className="hover:text-brand-600">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link></li>
            <li><Link href="/cookie-policy" className="hover:text-brand-600">Cookie Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-600">Terms of Use</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-800">Affiliate Disclosure</div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            As an Amazon Associate, we earn from qualifying purchases. Product prices
            and availability are accurate as of the date shown and may change on Amazon.
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-100 py-4 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} {config.site.name}. All rights reserved.
      </div>
    </footer>
  );
}
