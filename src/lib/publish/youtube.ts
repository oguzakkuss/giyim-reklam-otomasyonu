import { config } from "@/lib/config";
import type { PublishAdapter, PublishInput, PublishResult } from "./types";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.publish.youtube.clientId!,
      client_secret: config.publish.youtube.clientSecret!,
      refresh_token: config.publish.youtube.refreshToken!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`YouTube token: ${JSON.stringify(data)}`);
  return data.access_token;
}

/** YouTube Shorts olarak video yukler (multipart upload). */
export const youtubeAdapter: PublishAdapter = {
  platform: "youtube",
  enabled: () => config.publish.youtube.enabled,
  async publish({ videoUrl, caption, product }: PublishInput): Promise<PublishResult> {
    if (!config.publish.youtube.enabled) return { ok: false, manual: true };
    if (!videoUrl) return { ok: false, error: "Video yok (mock mod?)", manual: true };
    try {
      const accessToken = await getAccessToken();
      const videoRes = await fetch(videoUrl);
      const videoBlob = await videoRes.blob();

      const metadata = {
        snippet: {
          title: `${product.title.slice(0, 90)} #Shorts`,
          description: caption,
          categoryId: "22",
        },
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
      };

      const boundary = "----giyimboundary" + Date.now();
      const body = new Blob([
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
        JSON.stringify(metadata),
        `\r\n--${boundary}\r\nContent-Type: video/*\r\n\r\n`,
        videoBlob,
        `\r\n--${boundary}--\r\n`,
      ]);

      const res = await fetch(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        },
      );
      const data = await res.json();
      if (!data.id) return { ok: false, error: `YouTube: ${JSON.stringify(data)}` };
      return { ok: true, externalUrl: `https://youtube.com/shorts/${data.id}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "YouTube hata" };
    }
  },
};
