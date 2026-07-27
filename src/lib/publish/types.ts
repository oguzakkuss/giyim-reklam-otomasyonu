import type { Platform, Product } from "@/lib/db/types";

export interface PublishInput {
  product: Product;
  caption: string;
  videoUrl: string | null;
  imageUrl: string;
}

export interface PublishResult {
  ok: boolean;
  externalUrl?: string;
  error?: string;
  /** true ise otomatik yayin yok; kullanici indir+kopyala ile elle paylasmali. */
  manual?: boolean;
}

export interface PublishAdapter {
  platform: Platform;
  enabled(): boolean;
  publish(input: PublishInput): Promise<PublishResult>;
}
