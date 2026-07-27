import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Cerez Politikasi" };

export default function CookiePolicyPage() {
  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-2xl font-bold">Cerez Politikasi</h1>
      <p className="mt-4 text-neutral-600">
        {config.site.name}, deneyiminizi iyilestirmek, trafigi analiz etmek ve reklam
        gostermek icin cerezler kullanir.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Cerez Turleri</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-neutral-600">
        <li><strong>Zorunlu cerezler:</strong> Sitenin temel islevleri icin gereklidir.</li>
        <li><strong>Analitik cerezler:</strong> Google Analytics ile anonim kullanim olcumu.</li>
        <li><strong>Reklam cerezleri:</strong> Google AdSense ile ilgi alanina yonelik reklam.</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Cerezleri Yonetme</h2>
      <p className="mt-2 text-neutral-600">
        Tarayici ayarlarinizdan cerezleri istediginiz zaman silebilir veya engelleyebilirsiniz.
        Site acilisindaki banner uzerinden de tercihinizi belirtebilirsiniz.
      </p>
    </div>
  );
}
