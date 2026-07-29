import { config } from "@/lib/config";
import type { PublishAdapter, PublishInput, PublishResult } from "./types";

/** Pinterest'e orijinal gorseli pin olarak yukler. (Pinterest API v5) */
export const pinterestAdapter: PublishAdapter = {
  platform: "pinterest",
  enabled: () => config.publish.pinterest.enabled,
  async publish({ imageUrl, caption, product }: PublishInput): Promise<PublishResult> {
    if (!config.publish.pinterest.enabled) return { ok: false, manual: true };
    try {
      const res = await fetch("https://api.pinterest.com/v5/pins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.publish.pinterest.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: config.publish.pinterest.boardId,
          title: product.title.slice(0, 100),
          description: caption,
          link: `${config.site.url}/product/${product.slug}`,
          media_source: { source_type: "image_url", url: imageUrl },
        }),
      });
      if (!res.ok) return { ok: false, error: `Pinterest: ${res.status} ${await res.text()}` };
      const data = await res.json();
      return { ok: true, externalUrl: `https://pinterest.com/pin/${data.id}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Pinterest hata" };
    }
  },
};
