import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Iletisim" };

export default function ContactPage() {
  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-2xl font-bold">Iletisim</h1>
      <p className="mt-4 text-neutral-600">
        Soru, oneri ve is birligi talepleriniz icin bize asagidaki adresten ulasabilirsiniz.
      </p>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-sm font-semibold text-neutral-800">E-posta</div>
        <div className="mt-1 text-neutral-600">info@{new URL(config.site.url).hostname.replace("www.", "")}</div>
        <p className="mt-4 text-xs text-neutral-400">
          Bu adresi kendi domain e-postaniz ile guncelleyin (orn. Zoho Mail).
        </p>
      </div>
    </div>
  );
}
