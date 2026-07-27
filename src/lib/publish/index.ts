import type { Platform } from "@/lib/db/types";
import type { PublishAdapter } from "./types";
import { pinterestAdapter } from "./pinterest";
import { youtubeAdapter } from "./youtube";
import { instagramAdapter, facebookAdapter } from "./meta";
import { tiktokAdapter } from "./tiktok";

const adapters: Record<Platform, PublishAdapter> = {
  pinterest: pinterestAdapter,
  youtube: youtubeAdapter,
  instagram: instagramAdapter,
  facebook: facebookAdapter,
  tiktok: tiktokAdapter,
};

export function getAdapter(platform: Platform): PublishAdapter {
  return adapters[platform];
}

export function platformEnabled(platform: Platform): boolean {
  return adapters[platform].enabled();
}

export * from "./types";
