import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { config } from "@/lib/config";

/**
 * Luma videolari imzali URL ile gelir ve ~1 saat sonra expire olur.
 * Supabase Storage'a kopyalayarak kalici URL uretiriz.
 */
export async function persistRemoteMedia(
  remoteUrl: string,
  path: string,
  contentType = "video/mp4",
): Promise<string | null> {
  if (!config.supabase.enabled) return null;

  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Media download failed: ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());

  const sb = createClient(config.supabase.url!, config.supabase.serviceRoleKey!, {
    auth: { persistSession: false },
    realtime: { transport: ws as unknown as typeof WebSocket },
  });

  const { error } = await sb.storage.from(config.supabase.bucket).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = sb.storage.from(config.supabase.bucket).getPublicUrl(path);
  return data.publicUrl || null;
}
