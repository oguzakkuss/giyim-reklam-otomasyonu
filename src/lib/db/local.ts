import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
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
 * Gelistirme / anahtarsiz calisma icin dosya tabanli basit veri deposu.
 * NOT: Vercel gibi serverless ortamlarda dosya sistemi kalici degildir;
 * production icin Supabase kullanin (SUPABASE_* env'lerini doldurun).
 */

interface DbShape {
  products: Product[];
  assets: Asset[];
  captions: Caption[];
  posts: Post[];
  clicks: Click[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

async function readDb(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      products: parsed.products ?? [],
      assets: parsed.assets ?? [],
      captions: parsed.captions ?? [],
      posts: parsed.posts ?? [],
      clicks: parsed.clicks ?? [],
    };
  } catch {
    return { products: [], assets: [], captions: [], posts: [], clicks: [] };
  }
}

async function writeDb(db: DbShape): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export class LocalRepository implements Repository {
  async listProducts(): Promise<Product[]> {
    const db = await readDb();
    return [...db.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getProduct(id: string): Promise<Product | null> {
    const db = await readDb();
    return db.products.find((p) => p.id === id) ?? null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const db = await readDb();
    return db.products.find((p) => p.slug === slug) ?? null;
  }

  async createProduct(input: NewProductInput): Promise<Product> {
    const db = await readDb();
    let slug = slugify(input.title) || nanoid(6);
    while (db.products.some((p) => p.slug === slug)) {
      slug = `${slug}-${nanoid(4)}`;
    }
    const product: Product = {
      id: nanoid(),
      slug,
      amazonUrl: input.amazonUrl,
      affiliateUrl: input.affiliateUrl,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      price: input.price,
      createdAt: nowIso(),
    };
    db.products.push(product);
    await writeDb(db);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const db = await readDb();
    db.products = db.products.filter((p) => p.id !== id);
    db.assets = db.assets.filter((a) => a.productId !== id);
    db.captions = db.captions.filter((c) => c.productId !== id);
    db.posts = db.posts.filter((p) => p.productId !== id);
    await writeDb(db);
  }

  async getAsset(productId: string): Promise<Asset | null> {
    const db = await readDb();
    return db.assets.find((a) => a.productId === productId) ?? null;
  }

  async upsertAsset(
    productId: string,
    patch: Partial<Omit<Asset, "id" | "productId">>,
  ): Promise<Asset> {
    const db = await readDb();
    let asset = db.assets.find((a) => a.productId === productId);
    if (!asset) {
      asset = {
        id: nanoid(),
        productId,
        videoUrl: null,
        generatedPrompt: null,
        status: "idle",
        error: null,
        updatedAt: nowIso(),
      };
      db.assets.push(asset);
    }
    Object.assign(asset, patch, { updatedAt: nowIso() });
    await writeDb(db);
    return asset;
  }

  async listCaptions(productId: string): Promise<Caption[]> {
    const db = await readDb();
    return db.captions.filter((c) => c.productId === productId);
  }

  async upsertCaption(productId: string, platform: Platform, text: string): Promise<Caption> {
    const db = await readDb();
    let caption = db.captions.find((c) => c.productId === productId && c.platform === platform);
    if (!caption) {
      caption = { id: nanoid(), productId, platform, text, updatedAt: nowIso() };
      db.captions.push(caption);
    } else {
      caption.text = text;
      caption.updatedAt = nowIso();
    }
    await writeDb(db);
    return caption;
  }

  async listPosts(productId: string): Promise<Post[]> {
    const db = await readDb();
    return db.posts.filter((p) => p.productId === productId);
  }

  async upsertPost(
    productId: string,
    platform: Platform,
    patch: Partial<Omit<Post, "id" | "productId" | "platform">>,
  ): Promise<Post> {
    const db = await readDb();
    let post = db.posts.find((p) => p.productId === productId && p.platform === platform);
    if (!post) {
      post = {
        id: nanoid(),
        productId,
        platform,
        status: "draft",
        externalUrl: null,
        error: null,
        publishedAt: null,
        updatedAt: nowIso(),
      };
      db.posts.push(post);
    }
    Object.assign(post, patch, { updatedAt: nowIso() });
    await writeDb(db);
    return post;
  }

  async recordClick(input: Omit<Click, "id" | "timestamp">): Promise<Click> {
    const db = await readDb();
    const click: Click = { id: nanoid(), timestamp: nowIso(), ...input };
    db.clicks.push(click);
    await writeDb(db);
    return click;
  }

  async listClicks(): Promise<Click[]> {
    const db = await readDb();
    return db.clicks;
  }
}
