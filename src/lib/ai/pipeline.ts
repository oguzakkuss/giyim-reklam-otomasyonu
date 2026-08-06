import { getRepository } from "@/lib/db";
import { ALL_PLATFORMS } from "@/lib/db/types";
import { persistRemoteMedia } from "@/lib/storage";
import { generateContent } from "./captions";
import { generateVideo } from "./luma";

/**
 * Icerik uretim pipeline'i:
 *  1) Metin (video prompt + platform aciklamalari) uret ve kaydet
 *  2) Luma ile videoyu uret, mumkunse Storage'a kopyala, kaydet
 *  3) Her platform icin taslak post olustur
 *
 * Inngest etkinse arka planda, degilse generate API'sinde inline calisir.
 */
export async function runGenerationPipeline(productId: string): Promise<void> {
  const repo = getRepository();
  const product = await repo.getProduct(productId);
  if (!product) throw new Error("Urun bulunamadi");

  await repo.upsertAsset(productId, { status: "pending", error: null });

  try {
    // 1) Metin uretimi
    const content = await generateContent(product);
    for (const platform of ALL_PLATFORMS) {
      await repo.upsertCaption(productId, platform, content.captions[platform]);
      await repo.upsertPost(productId, platform, { status: "draft" });
    }
    await repo.upsertAsset(productId, { generatedPrompt: content.videoPrompt });

    // 2) Video uretimi (Luma)
    const video = await generateVideo(content.videoPrompt, product.imageUrl);
    let videoUrl = video.videoUrl;
    if (videoUrl) {
      try {
        const permanent = await persistRemoteMedia(
          videoUrl,
          `videos/${productId}-${Date.now()}.mp4`,
        );
        if (permanent) videoUrl = permanent;
      } catch (err) {
        console.error("Video Storage'a kopyalanamadi, Luma URL kullanilacak:", err);
      }
    }

    await repo.upsertAsset(productId, {
      videoUrl,
      status: "ready",
      error: video.mock ? "MOCK: LUMA_API_KEY tanimli degil, gercek video uretilmedi." : null,
    });
  } catch (err) {
    await repo.upsertAsset(productId, {
      status: "failed",
      error: err instanceof Error ? err.message : "Bilinmeyen hata",
    });
    throw err;
  }
}
