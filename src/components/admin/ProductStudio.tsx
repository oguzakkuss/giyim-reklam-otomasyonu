"use client";

import { useCallback, useEffect, useState } from "react";
import { platformLabel } from "@/lib/utils";
import { ALL_PLATFORMS, VIDEO_PLATFORMS } from "@/lib/db/types";
import type { Asset, Caption, Platform, Post, Product } from "@/lib/db/types";

interface Bundle {
  product: Product;
  asset: Asset | null;
  captions: Caption[];
  posts: Post[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  approved: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function ProductStudio({ initial }: { initial: Bundle }) {
  const [data, setData] = useState<Bundle>(initial);
  const [generating, setGenerating] = useState(false);
  const [busyPlatform, setBusyPlatform] = useState<Platform | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const productId = data.product.id;

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/products/${productId}`);
    if (res.ok) setData(await res.json());
  }, [productId]);

  // Uretim beklerken durumu yokla
  useEffect(() => {
    if (data.asset?.status !== "pending") return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [data.asset?.status, refresh]);

  async function generate() {
    setGenerating(true);
    setNotice(null);
    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setGenerating(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setNotice("Uretim hatasi: " + (err.error ?? "bilinmeyen"));
    }
    await refresh();
  }

  function captionFor(platform: Platform): string {
    return data.captions.find((c) => c.platform === platform)?.text ?? "";
  }

  function postFor(platform: Platform): Post | undefined {
    return data.posts.find((p) => p.platform === platform);
  }

  async function saveCaption(platform: Platform, text: string) {
    setData((d) => ({
      ...d,
      captions: upsert(d.captions, platform, text),
    }));
    await fetch("/api/admin/captions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, platform, text }),
    });
  }

  async function setStatus(platform: Platform, status: string) {
    await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, platform, status }),
    });
    await refresh();
  }

  async function publish(platform: Platform) {
    setBusyPlatform(platform);
    setNotice(null);
    const res = await fetch("/api/admin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, platform }),
    });
    const result = await res.json().catch(() => ({}));
    setBusyPlatform(null);
    if (result.manual) {
      setNotice(`${platformLabel(platform)}: API ayarli degil. Asagidan videoyu/gorseli indirip aciklamayi kopyalayarak elle paylasin.`);
    } else if (result.ok) {
      setNotice(`${platformLabel(platform)}: yayinlandi ✔`);
    } else {
      setNotice(`${platformLabel(platform)} hata: ${result.error ?? "bilinmeyen"}`);
    }
    await refresh();
  }

  function copyCaption(platform: Platform) {
    navigator.clipboard.writeText(captionFor(platform));
    setNotice(`${platformLabel(platform)} aciklamasi kopyalandi.`);
  }

  const asset = data.asset;
  const status = asset?.status ?? "idle";
  const hasContent = data.captions.length > 0;
  const mediaUrl = (p: Platform) => (p === "pinterest" ? data.product.imageUrl : asset?.videoUrl);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sol: urun + video */}
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.product.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-3 font-semibold text-neutral-800">{data.product.title}</h2>
          {data.product.price && <div className="mt-1 font-bold text-brand-600">{data.product.price}</div>}
          <a
            href={data.product.affiliateUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate text-xs text-neutral-400 hover:text-brand-600"
          >
            {data.product.affiliateUrl}
          </a>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-neutral-800">Video</span>
            <StatusBadge status={status} />
          </div>

          {status === "ready" && asset?.videoUrl ? (
            <video src={asset.videoUrl} controls className="w-full rounded-xl bg-black" />
          ) : status === "ready" && !asset?.videoUrl ? (
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-700">
              Mock mod: video uretilmedi. Gercek video icin <code>LUMA_API_KEY</code> ekleyin.
            </div>
          ) : status === "pending" ? (
            <div className="grid place-items-center rounded-xl bg-neutral-100 p-8 text-sm text-neutral-500">
              Uretiliyor... (Luma 1-3 dk surebilir)
            </div>
          ) : status === "failed" ? (
            <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-4 text-xs text-red-700">
              {asset?.error ?? "Uretim basarisiz."}
            </div>
          ) : (
            <div className="grid place-items-center rounded-xl bg-neutral-100 p-8 text-sm text-neutral-400">
              Henuz uretilmedi
            </div>
          )}

          {asset?.videoUrl && (
            <a
              href={asset.videoUrl}
              download
              className="mt-3 block rounded-lg border border-neutral-300 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Videoyu indir
            </a>
          )}

          <button
            onClick={generate}
            disabled={generating || status === "pending"}
            className="mt-3 w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {generating || status === "pending"
              ? "Uretiliyor..."
              : hasContent
                ? "Yeniden Uret"
                : "Icerik + Video Uret"}
          </button>
          {asset?.generatedPrompt && (
            <details className="mt-3 text-xs text-neutral-500">
              <summary className="cursor-pointer">Video prompt</summary>
              <p className="mt-1 whitespace-pre-wrap">{asset.generatedPrompt}</p>
            </details>
          )}
        </div>
      </div>

      {/* Sag: platform kartlari */}
      <div className="space-y-4 lg:col-span-2">
        {notice && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">{notice}</div>
        )}

        {!hasContent && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
            Once soldaki <strong>Icerik + Video Uret</strong> butonuna basin. Her platform icin
            aciklama metinleri ve video burada olusacak.
          </div>
        )}

        {hasContent &&
          ALL_PLATFORMS.map((platform) => {
            const post = postFor(platform);
            const pstatus = post?.status ?? "draft";
            const isVideo = VIDEO_PLATFORMS.includes(platform);
            return (
              <div key={platform} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-800">{platformLabel(platform)}</span>
                    <span className="text-xs text-neutral-400">{isVideo ? "Video" : "Gorsel"}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[pstatus]}`}>
                    {pstatus}
                  </span>
                </div>

                <textarea
                  defaultValue={captionFor(platform)}
                  onBlur={(e) => saveCaption(platform, e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => copyCaption(platform)}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Aciklamayi kopyala
                  </button>
                  {mediaUrl(platform) && (
                    <a
                      href={mediaUrl(platform)!}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      {isVideo ? "Videoyu indir" : "Gorseli indir"}
                    </a>
                  )}
                  {pstatus !== "approved" && pstatus !== "published" && (
                    <button
                      onClick={() => setStatus(platform, "approved")}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Onayla
                    </button>
                  )}
                  <button
                    onClick={() => publish(platform)}
                    disabled={busyPlatform === platform}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {busyPlatform === platform ? "Yayinlaniyor..." : "Yayinla"}
                  </button>
                  {post?.externalUrl && (
                    <a
                      href={post.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:underline"
                    >
                      Gonderiyi gor ↗
                    </a>
                  )}
                </div>
                {post?.error && <p className="mt-2 text-xs text-red-600">{post.error}</p>}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    idle: "bg-neutral-100 text-neutral-500",
    pending: "bg-blue-100 text-blue-700",
    ready: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function upsert(captions: Caption[], platform: Platform, text: string): Caption[] {
  const exists = captions.some((c) => c.platform === platform);
  if (exists) return captions.map((c) => (c.platform === platform ? { ...c, text } : c));
  return [
    ...captions,
    { id: `tmp-${platform}`, productId: "", platform, text, updatedAt: new Date().toISOString() },
  ];
}
