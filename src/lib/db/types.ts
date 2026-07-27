/** Veri modeli tipleri (plan bolum 3). */

export type AssetStatus = "idle" | "pending" | "ready" | "failed";
export type PostStatus = "draft" | "approved" | "published" | "failed";

export type Platform =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "youtube"
  | "pinterest";

export const VIDEO_PLATFORMS: Platform[] = [
  "tiktok",
  "instagram",
  "facebook",
  "youtube",
];
export const IMAGE_PLATFORMS: Platform[] = ["pinterest"];
export const ALL_PLATFORMS: Platform[] = [...VIDEO_PLATFORMS, ...IMAGE_PLATFORMS];

export interface Product {
  id: string;
  slug: string;
  amazonUrl: string;
  affiliateUrl: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string | null;
  createdAt: string;
}

export interface Asset {
  id: string;
  productId: string;
  videoUrl: string | null;
  generatedPrompt: string | null;
  status: AssetStatus;
  error: string | null;
  updatedAt: string;
}

export interface Caption {
  id: string;
  productId: string;
  platform: Platform;
  text: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  productId: string;
  platform: Platform;
  status: PostStatus;
  externalUrl: string | null;
  error: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface Click {
  id: string;
  productId: string;
  timestamp: string;
  referrer: string | null;
  isAffiliate: boolean;
}

export interface NewProductInput {
  amazonUrl: string;
  affiliateUrl: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string | null;
}

export interface Repository {
  // products
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(input: NewProductInput): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // assets
  getAsset(productId: string): Promise<Asset | null>;
  upsertAsset(productId: string, patch: Partial<Omit<Asset, "id" | "productId">>): Promise<Asset>;

  // captions
  listCaptions(productId: string): Promise<Caption[]>;
  upsertCaption(productId: string, platform: Platform, text: string): Promise<Caption>;

  // posts
  listPosts(productId: string): Promise<Post[]>;
  upsertPost(productId: string, platform: Platform, patch: Partial<Omit<Post, "id" | "productId" | "platform">>): Promise<Post>;

  // clicks
  recordClick(input: Omit<Click, "id" | "timestamp">): Promise<Click>;
  listClicks(): Promise<Click[]>;
}
