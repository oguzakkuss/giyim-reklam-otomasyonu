import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { getAdapter } from "@/lib/publish";
import { nowIso } from "@/lib/utils";
import type { Platform } from "@/lib/db/types";

export const maxDuration = 300;

/**
 * Bir urunu belirtilen platforma yayinlar.
 * Adapter aktif degilse manuel mod (indir+kopyala) doner.
 */
export async function POST(req: NextRequest) {
  const { productId, platform } = await req.json().catch(() => ({}));
  if (!productId || !platform) {
    return NextResponse.json({ error: "productId ve platform gerekli" }, { status: 400 });
  }

  const repo = getRepository();
  const product = await repo.getProduct(productId);
  if (!product) return NextResponse.json({ error: "Urun bulunamadi" }, { status: 404 });

  const asset = await repo.getAsset(productId);
  const captions = await repo.listCaptions(productId);
  const caption = captions.find((c) => c.platform === platform)?.text ?? "";

  const adapter = getAdapter(platform as Platform);
  const result = await adapter.publish({
    product,
    caption,
    videoUrl: asset?.videoUrl ?? null,
    imageUrl: product.imageUrl,
  });

  if (result.manual) {
    return NextResponse.json({ manual: true, message: "Bu platform icin API ayarli degil. Indir + kopyala ile elle paylasin." });
  }

  if (result.ok) {
    await repo.upsertPost(productId, platform as Platform, {
      status: "published",
      externalUrl: result.externalUrl ?? null,
      error: null,
      publishedAt: nowIso(),
    });
    return NextResponse.json({ ok: true, externalUrl: result.externalUrl });
  }

  await repo.upsertPost(productId, platform as Platform, {
    status: "failed",
    error: result.error ?? "Bilinmeyen hata",
  });
  return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
}
