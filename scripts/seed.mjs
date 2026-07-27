// Yerel JSON store'a ornek urunler ekler (gorseller Unsplash).
// Kullanim: node scripts/seed.mjs
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
    title: "Oversize Keten Gomlek - Bej",
    price: "449,90 TL",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    description: "Yazlik keten kumasi ve rahat kesimiyle gunluk kombinlerin vazgecilmezi.",
  },
  {
    title: "Yuksek Bel Wide Leg Pantolon",
    price: "599,00 TL",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    description: "Bol paca kesim ve yuksek bel ile hem sik hem konforlu bir siluet.",
  },
  {
    title: "Triko Kazak - Kirik Beyaz",
    price: "379,90 TL",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    description: "Yumusak dokulu triko kazak, soguk gunlerde sicak ve sik bir secim.",
  },
  {
    title: "Deri Ceket - Siyah",
    price: "1.299,00 TL",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    description: "Zamansiz deri ceket, her gardiroba karakter katan bir parca.",
  },
  {
    title: "Midi Sifon Elbise - Cicekli",
    price: "699,90 TL",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    description: "Akici sifon kumas ve zarif cicek deseniyle bahar-yaz favorisi.",
  },
  {
    title: "Spor Ayakkabi - Retro",
    price: "899,00 TL",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    description: "Retro tasarim ve gunluk konfor bir arada. Her kombine uyum saglar.",
  },
];

const now = Date.now();
const products = demo.map((d, i) => {
  const slug = slugify(d.title);
  return {
    id: `seed-${i + 1}`,
    slug,
    amazonUrl: `https://www.amazon.com.tr/dp/DEMO${i + 1}`,
    affiliateUrl: `https://www.amazon.com.tr/dp/DEMO${i + 1}?tag=demo-21`,
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
console.log(`${products.length} ornek urun eklendi -> ${DB_PATH}`);
