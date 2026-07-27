import { config } from "@/lib/config";

/**
 * Luma Dream Machine - gorselden video (image-to-video) uretimi.
 * https://docs.lumalabs.ai/  (Dream Machine API)
 *
 * LUMA_API_KEY yoksa mock doner (video uretilmez, mock=true).
 */

const LUMA_BASE = "https://api.lumalabs.ai/dream-machine/v1";

export interface VideoResult {
  videoUrl: string | null;
  mock: boolean;
}

async function poll(id: string, timeoutMs = 240_000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${LUMA_BASE}/generations/${id}`, {
      headers: { Authorization: `Bearer ${config.luma.apiKey}` },
    });
    if (!res.ok) throw new Error(`Luma poll hata: ${res.status} ${await res.text()}`);
    const data = await res.json();
    if (data.state === "completed") {
      const url = data?.assets?.video;
      if (!url) throw new Error("Luma: video URL bulunamadi");
      return url;
    }
    if (data.state === "failed") {
      throw new Error(`Luma uretim basarisiz: ${data?.failure_reason ?? "bilinmiyor"}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Luma: zaman asimi (video uretimi cok uzun surdu)");
}

export async function generateVideo(prompt: string, imageUrl: string): Promise<VideoResult> {
  if (!config.luma.enabled) {
    return { videoUrl: null, mock: true };
  }

  const res = await fetch(`${LUMA_BASE}/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.luma.apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "9:16",
      keyframes: { frame0: { type: "image", url: imageUrl } },
    }),
  });

  if (!res.ok) throw new Error(`Luma create hata: ${res.status} ${await res.text()}`);
  const created = await res.json();
  const videoUrl = await poll(created.id);
  return { videoUrl, mock: false };
}
