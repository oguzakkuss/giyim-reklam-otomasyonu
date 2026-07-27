import { config } from "@/lib/config";
import type { PublishAdapter, PublishInput, PublishResult } from "./types";

/**
 * TikTok Content Posting API - PULL_FROM_URL ile video yukler.
 * NOT: Uygulamanizin onaylanmis olmasi ve video URL alan adinin dogrulanmis
 * olmasi gerekir. Onay gelene kadar manuel fallback kullanin.
 */
export const tiktokAdapter: PublishAdapter = {
  platform: "tiktok",
  enabled: () => config.publish.tiktok.enabled,
  async publish({ videoUrl, caption }: PublishInput): Promise<PublishResult> {
    if (!config.publish.tiktok.enabled) return { ok: false, manual: true };
    if (!videoUrl) return { ok: false, error: "Video yok (mock mod?)", manual: true };
    try {
      const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.publish.tiktok.token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: caption.slice(0, 2200),
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: videoUrl,
          },
        }),
      });
      const data = await res.json();
      if (data?.error?.code && data.error.code !== "ok") {
        return { ok: false, error: `TikTok: ${JSON.stringify(data.error)}` };
      }
      return { ok: true, externalUrl: undefined };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "TikTok hata" };
    }
  },
};
