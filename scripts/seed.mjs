// Adds sample products to the local JSON store (images from Unsplash).
// Usage: node scripts/seed.mjs
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const demo = [
  {
    title: "Relaxed Linen Shirt - Light Blue",
    price: "$39.99",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    description: "A relaxed button-down with an easy silhouette for casual everyday outfits.",
  },
  {
    title: "High-Waisted Wide-Leg Pants",
    price: "$49.99",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    description: "A wide-leg silhouette with a high rise for polished, comfortable styling.",
  },
  {
    title: "Graphic Knit Top - Ivory",
    price: "$34.99",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    description: "A soft, versatile layer designed for easy everyday combinations.",
  },
  {
    title: "Classic Faux-Leather Jacket - Black",
    price: "$89.99",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    description: "A timeless moto-inspired layer that adds an edge to everyday outfits.",
  },
  {
    title: "Floral Midi Dress",
    price: "$59.99",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    description: "A flowing floral midi silhouette suited to spring and summer occasions.",
  },
  {
    title: "Retro Everyday Sneakers",
    price: "$69.99",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    description: "A retro-inspired sneaker designed to complement casual daily outfits.",
  },
];

const now = Date.now();
const products = demo.map((d, i) => {
  const slug = slugify(d.title);
  return {
    id: `seed-${i + 1}`,
    slug,
    amazonUrl: `https://www.amazon.com/dp/DEMO${i + 1}`,
    affiliateUrl: `https://www.amazon.com/dp/DEMO${i + 1}?tag=demo-20`,
    title: d.title,
    description: d.description,
    imageUrl: d.imageUrl,
    price: d.price,
    createdAt: new Date(now - i * 60000).toISOString(),
  };
});

const db = { products, assets: [], captions: [], posts: [], clicks: [] };

await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
console.log(`${products.length} sample products added -> ${DB_PATH}`);
