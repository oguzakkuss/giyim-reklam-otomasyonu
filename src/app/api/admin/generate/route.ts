import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/db";
import { runGenerationPipeline } from "@/lib/ai/pipeline";
import { inngest } from "@/lib/inngest/client";

export const maxDuration = 300; // Luma bekleme suresi icin (Vercel Pro)

/**
 * Icerik + video uretimini tetikler.
 * - Inngest etkinse event gonderir (arka planda calisir), hemen doner.
 * - Degilse pipeline'i inline calistirir (mock modda saniyeler surer).
 */
export async function POST(req: NextRequest) {
  const { productId } = await req.json().catch(() => ({ productId: "" }));
  if (!productId) {
    return NextResponse.json({ error: "productId gerekli" }, { status: 400 });
  }

  const repo = getRepository();
  const product = await repo.getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Urun bulunamadi" }, { status: 404 });
  }

  if (config.inngest.enabled) {
    await repo.upsertAsset(productId, { status: "pending", error: null });
    await inngest.send({ name: "content/generate.requested", data: { productId } });
    return NextResponse.json({ ok: true, mode: "background" });
  }

  try {
    await runGenerationPipeline(productId);
    return NextResponse.json({ ok: true, mode: "inline" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Uretim basarisiz" },
      { status: 500 },
    );
  }
}
