"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AddProductPage() {
  const router = useRouter();
  const [amazonUrl, setAmazonUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function lookup() {
    if (!amazonUrl) return;
    setLooking(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/products/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: amazonUrl }),
      });
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.price) setPrice(data.price);
      if (data.affiliateUrl) setAffiliateUrl(data.affiliateUrl);
      setMsg(
        data.title
          ? "Veri PA-API'den cekildi."
          : "PA-API ayarli degil. Baslik/gorseli elle girin. (Affiliate link olusturuldu.)",
      );
    } catch {
      setMsg("Link okunamadi, alanlari elle doldurun.");
    }
    setLooking(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amazonUrl,
        title,
        description,
        imageUrl,
        price: price || null,
        affiliateUrl: affiliateUrl || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const product = await res.json();
      router.push(`/admin/urun/${product.id}`);
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg("Kaydedilemedi: " + JSON.stringify(err.error ?? "hata"));
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Urun Ekle</h1>

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Amazon urun linki</label>
            <div className="flex gap-2">
              <input
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                placeholder="https://www.amazon.com.tr/dp/XXXXXXXXXX"
                className={inputCls}
                required
              />
              <button
                type="button"
                onClick={lookup}
                disabled={looking}
                className="shrink-0 rounded-lg border border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
              >
                {looking ? "..." : "Getir"}
              </button>
            </div>
            {msg && <p className="mt-2 text-xs text-neutral-500">{msg}</p>}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <label className="mb-1 block text-sm font-medium text-neutral-700">Baslik</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />

            <label className="mb-1 mt-4 block text-sm font-medium text-neutral-700">Aciklama (SEO/AdSense icin ozgun metin)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={inputCls}
              placeholder="Urun hakkinda 2-3 cumle ozgun aciklama..."
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Gorsel URL</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Fiyat (opsiyonel)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="399,90 TL" />
              </div>
            </div>

            <label className="mb-1 mt-4 block text-sm font-medium text-neutral-700">Affiliate URL (bos ise otomatik uretilir)</label>
            <input value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} className={inputCls} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydet ve Studyoya Git"}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-2 text-sm font-medium text-neutral-700">Onizleme</div>
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-neutral-400">Gorsel yok</div>
              )}
            </div>
            <div className="mt-3 line-clamp-2 text-sm font-semibold">{title || "Baslik"}</div>
            {price && <div className="mt-1 font-bold text-brand-600">{price}</div>}
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
