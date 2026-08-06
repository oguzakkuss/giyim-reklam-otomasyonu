import { config } from "@/lib/config";

/**
 * Luma Agents API - image-to-video (Ray 3.2).
 * Docs: https://docs.agents.lumalabs.ai/
 * Base: https://agents.lumalabs.ai/v1
 *
 * LUMA_API_KEY yoksa mock doner (video uretilmez, mock=true).
 * Not: Eski Dream Machine API (api.lumalabs.ai/dream-machine) yerine
 * yeni Agents API kullanilir; anahtar formati genelde `luma-api-...`.
 */

const LUMA_BASE = "https://agents.lumalabs.ai/v1";

export interface VideoResult {
  videoUrl: string | null;
  mock: boolean;
}

async function poll(id: string, timeoutMs = 600_000): Promise<string> {
  const start = Date.now();
  // Video jobs are slower; wait a bit before polling hard.
  await new Promise((r) => setTimeout(r, 15_000));

  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${LUMA_BASE}/generations/${id}`, {
      headers: {
        Authorization: `Bearer ${config.luma.apiKey}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`Luma poll hata: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const state = data.state ?? data.status;
    if (state === "completed") {
      const url =
        data?.output?.[0]?.url ??
        data?.assets?.video ??
        data?.video?.url ??
        null;
      if (!url) throw new Error("Luma: video URL bulunamadi");
      return url;
    }
    if (state === "failed") {
      throw new Error(
        `Luma uretim basarisiz: ${data?.failure_reason ?? data?.failure_code ?? "bilinmiyor"}`,
      );
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
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: "ray-3.2",
      type: "video",
      prompt,
      aspect_ratio: "9:16",
      video: {
        resolution: "720p",
        duration: "5s",
        start_frame: { url: imageUrl },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 402) {
      throw new Error(
        "Luma hesabinda bakiye yok (402). platform.lumalabs.ai uzerinden kredi ekleyin.",
      );
    }
    throw new Error(`Luma create hata: ${res.status} ${body}`);
  }

  const created = await res.json();
  const videoUrl = await poll(created.id);
  return { videoUrl, mock: false };
}
