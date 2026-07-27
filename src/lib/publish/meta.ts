import { config } from "@/lib/config";
import type { PublishAdapter, PublishInput, PublishResult } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

async function waitIgContainer(containerId: string, token: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${GRAPH}/${containerId}?fields=status_code&access_token=${token}`);
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("IG medya isleme hatasi");
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error("IG medya isleme zaman asimi");
}

/** Instagram Reels olarak video yukler. (Meta Graph API) */
export const instagramAdapter: PublishAdapter = {
  platform: "instagram",
  enabled: () => config.publish.meta.igEnabled,
  async publish({ videoUrl, caption }: PublishInput): Promise<PublishResult> {
    if (!config.publish.meta.igEnabled) return { ok: false, manual: true };
    if (!videoUrl) return { ok: false, error: "Video yok (mock mod?)", manual: true };
    const token = config.publish.meta.token!;
    const ig = config.publish.meta.igUserId!;
    try {
      const createRes = await fetch(`${GRAPH}/${ig}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          access_token: token,
        }),
      });
      const created = await createRes.json();
      if (!created.id) return { ok: false, error: `IG: ${JSON.stringify(created)}` };
      await waitIgContainer(created.id, token);
      const pubRes = await fetch(`${GRAPH}/${ig}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: created.id, access_token: token }),
      });
      const published = await pubRes.json();
      if (!published.id) return { ok: false, error: `IG publish: ${JSON.stringify(published)}` };
      return { ok: true, externalUrl: `https://instagram.com/reel/${published.id}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "IG hata" };
    }
  },
};

/** Facebook Sayfasina video yukler. (Meta Graph API) */
export const facebookAdapter: PublishAdapter = {
  platform: "facebook",
  enabled: () => config.publish.meta.fbEnabled,
  async publish({ videoUrl, caption }: PublishInput): Promise<PublishResult> {
    if (!config.publish.meta.fbEnabled) return { ok: false, manual: true };
    if (!videoUrl) return { ok: false, error: "Video yok (mock mod?)", manual: true };
    const token = config.publish.meta.token!;
    const page = config.publish.meta.fbPageId!;
    try {
      const res = await fetch(`${GRAPH}/${page}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: videoUrl, description: caption, access_token: token }),
      });
      const data = await res.json();
      if (!data.id) return { ok: false, error: `FB: ${JSON.stringify(data)}` };
      return { ok: true, externalUrl: `https://facebook.com/${data.id}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "FB hata" };
    }
  },
};
