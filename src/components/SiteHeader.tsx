import Link from "next/link";
import { config } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="container-max flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white">
            M
          </span>
          <span className="text-lg font-bold tracking-tight">{config.site.name}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-neutral-600">
          <Link href="/" className="hover:text-brand-600">
            Kesfet
          </Link>
          <Link href="/iletisim" className="hover:text-brand-600">
            Iletisim
          </Link>
        </nav>
      </div>
    </header>
  );
}
