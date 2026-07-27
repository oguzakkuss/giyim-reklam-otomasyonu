import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { nanoid } from "nanoid";
import { config } from "@/lib/config";
import { nowIso, slugify } from "@/lib/utils";
import type {
  Asset,
  Caption,
  Click,
  NewProductInput,
  Platform,
  Post,
  Product,
  Repository,
} from "./types";

/**
 * Supabase (Postgres) tabanli veri deposu. Sema icin supabase/schema.sql'e bakin.
 * Kolonlar snake_case; burada camelCase'e cevriliyor.
 */

function client(): SupabaseClient {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!, {
    auth: { persistSession: false },
    // Node 20'de native WebSocket yok; realtime istemcisi icin ws gerekli.
    realtime: { transport: ws as unknown as typeof WebSocket },
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const toProduct = (r: any): Product => ({
  id: r.id,
  slug: r.slug,
  amazonUrl: r.amazon_url,
  affiliateUrl: r.affiliate_url,
  title: r.title,
  description: r.description,
  imageUrl: r.image_url,
  price: r.price,
  createdAt: r.created_at,
});

const toAsset = (r: any): Asset => ({
  id: r.id,
  productId: r.product_id,
  videoUrl: r.video_url,
  generatedPrompt: r.generated_prompt,
  status: r.status,
  error: r.error,
  updatedAt: r.updated_at,
});

const toCaption = (r: any): Caption => ({
  id: r.id,
  productId: r.product_id,
  platform: r.platform,
  text: r.text,
  updatedAt: r.updated_at,
});

const toPost = (r: any): Post => ({
  id: r.id,
  productId: r.product_id,
  platform: r.platform,
  status: r.status,
  externalUrl: r.external_url,
  error: r.error,
  publishedAt: r.published_at,
  updatedAt: r.updated_at,
});

const toClick = (r: any): Click => ({
  id: r.id,
  productId: r.product_id,
  timestamp: r.timestamp,
  referrer: r.referrer,
  isAffiliate: r.is_affiliate,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export class SupabaseRepository implements Repository {
  async listProducts(): Promise<Product[]> {
    const { data, error } = await client()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toProduct);
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data } = await client().from("products").select("*").eq("id", id).maybeSingle();
    return data ? toProduct(data) : null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data } = await client().from("products").select("*").eq("slug", slug).maybeSingle();
    return data ? toProduct(data) : null;
  }

  async createProduct(input: NewProductInput): Promise<Product> {
    const db = client();
    let slug = slugify(input.title) || nanoid(6);
    const { data: existing } = await db.from("products").select("slug").eq("slug", slug).maybeSingle();
    if (existing) slug = `${slug}-${nanoid(4)}`;
    const row = {
      id: nanoid(),
      slug,
      amazon_url: input.amazonUrl,
      affiliate_url: input.affiliateUrl,
      title: input.title,
      description: input.description,
      image_url: input.imageUrl,
      price: input.price,
      created_at: nowIso(),
    };
    const { data, error } = await db.from("products").insert(row).select("*").single();
    if (error) throw error;
    return toProduct(data);
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await client().from("products").delete().eq("id", id);
    if (error) throw error;
  }

  async getAsset(productId: string): Promise<Asset | null> {
    const { data } = await client().from("assets").select("*").eq("product_id", productId).maybeSingle();
    return data ? toAsset(data) : null;
  }

  async upsertAsset(
    productId: string,
    patch: Partial<Omit<Asset, "id" | "productId">>,
  ): Promise<Asset> {
    const db = client();
    const row: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.videoUrl !== undefined) row.video_url = patch.videoUrl;
    if (patch.generatedPrompt !== undefined) row.generated_prompt = patch.generatedPrompt;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.error !== undefined) row.error = patch.error;
    const { data, error } = await db
      .from("assets")
      .upsert({ id: nanoid(), product_id: productId, ...row }, { onConflict: "product_id" })
      .select("*")
      .single();
    if (error) throw error;
    return toAsset(data);
  }

  async listCaptions(productId: string): Promise<Caption[]> {
    const { data } = await client().from("captions").select("*").eq("product_id", productId);
    return (data ?? []).map(toCaption);
  }

  async upsertCaption(productId: string, platform: Platform, text: string): Promise<Caption> {
    const { data, error } = await client()
      .from("captions")
      .upsert(
        { id: nanoid(), product_id: productId, platform, text, updated_at: nowIso() },
        { onConflict: "product_id,platform" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return toCaption(data);
  }

  async listPosts(productId: string): Promise<Post[]> {
    const { data } = await client().from("posts").select("*").eq("product_id", productId);
    return (data ?? []).map(toPost);
  }

  async upsertPost(
    productId: string,
    platform: Platform,
    patch: Partial<Omit<Post, "id" | "productId" | "platform">>,
  ): Promise<Post> {
    const row: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.externalUrl !== undefined) row.external_url = patch.externalUrl;
    if (patch.error !== undefined) row.error = patch.error;
    if (patch.publishedAt !== undefined) row.published_at = patch.publishedAt;
    const { data, error } = await client()
      .from("posts")
      .upsert(
        { id: nanoid(), product_id: productId, platform, ...row },
        { onConflict: "product_id,platform" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return toPost(data);
  }

  async recordClick(input: Omit<Click, "id" | "timestamp">): Promise<Click> {
    const { data, error } = await client()
      .from("clicks")
      .insert({
        id: nanoid(),
        product_id: input.productId,
        timestamp: nowIso(),
        referrer: input.referrer,
        is_affiliate: input.isAffiliate,
      })
      .select("*")
      .single();
    if (error) throw error;
    return toClick(data);
  }

  async listClicks(): Promise<Click[]> {
    const { data } = await client().from("clicks").select("*");
    return (data ?? []).map(toClick);
  }
}
