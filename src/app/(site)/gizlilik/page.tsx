import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Gizlilik Politikasi" };

export default function PrivacyPage() {
  return (
    <div className="container-max prose prose-neutral max-w-3xl py-12">
      <h1 className="text-2xl font-bold">Gizlilik Politikasi</h1>
      <p className="mt-4 text-neutral-600">
        {config.site.name} olarak gizliliginize onem veriyoruz. Bu politika, hangi
        verileri hangi amacla isledigimizi aciklar.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Toplanan Veriler</h2>
      <p className="mt-2 text-neutral-600">
        Site ziyaretlerinizde, analitik ve reklam amaciyla cerezler araciligiyla anonim
        kullanim verileri (sayfa goruntuleme, tiklama, cihaz/tarayici bilgisi) toplanabilir.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Reklam ve Analitik</h2>
      <p className="mt-2 text-neutral-600">
        Sitemizde Google AdSense reklamlari ve Google Analytics kullanilabilir. Ucuncu
        taraf saglayicilar, ilgi alaniniza yonelik reklam gostermek icin cerez kullanabilir.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Affiliate Baglantilar</h2>
      <p className="mt-2 text-neutral-600">
        Sitemizdeki urun baglantilari affiliate baglantilaridir. Bir Amazon Associate
        olarak, uygun alisverislerden komisyon kazaniyoruz. Bu, sizin icin ek bir maliyet
        olusturmaz.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Haklariniz (KVKK / GDPR)</h2>
      <p className="mt-2 text-neutral-600">
        Kisisel verilerinize erisme, duzeltme ve silme talep etme hakkina sahipsiniz.
        Talepleriniz icin iletisim sayfamizdan bize ulasabilirsiniz.
      </p>
    </div>
  );
}
