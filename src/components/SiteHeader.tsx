import Link from "next/link";
import { config } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="container-max flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white">
            A
          </span>
          <span className="text-lg font-bold tracking-tight">{config.site.name}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-neutral-600">
          <Link href="/" className="hover:text-brand-600">
            Discover
          </Link>
          <Link href="/about" className="hover:text-brand-600">
            About
          </Link>
          <Link href="/contact" className="hover:text-brand-600">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
