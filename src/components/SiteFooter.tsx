import Link from "next/link";
import { config } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="container-max grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <div className="text-lg font-bold">{config.site.name}</div>
          <p className="mt-2 max-w-xs text-sm text-neutral-500">
            Gunun one cikan giyim urunlerini derleyen moda vitrini.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-800">Sayfalar</div>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li><Link href="/" className="hover:text-brand-600">Ana Sayfa</Link></li>
            <li><Link href="/iletisim" className="hover:text-brand-600">Iletisim</Link></li>
            <li><Link href="/gizlilik" className="hover:text-brand-600">Gizlilik Politikasi</Link></li>
            <li><Link href="/cerez-politikasi" className="hover:text-brand-600">Cerez Politikasi</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-800">Bilgilendirme</div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            Bir Amazon Associate olarak, uygun alisverislerden komisyon kazaniyoruz.
            (&ldquo;As an Amazon Associate we earn from qualifying purchases.&rdquo;)
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-100 py-4 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} {config.site.name}. Tum haklari saklidir.
      </div>
    </footer>
  );
}
