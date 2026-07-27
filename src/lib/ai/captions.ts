import { config } from "@/lib/config";
import { VIDEO_PLATFORMS, IMAGE_PLATFORMS, type Platform, type Product } from "@/lib/db/types";

export interface GeneratedContent {
  videoPrompt: string;
  captions: Record<Platform, string>;
}

function productUrl(product: Product): string {
  return `${config.site.url}/urun/${product.slug}`;
}

/** LLM yoksa kullanilacak sablon tabanli (mock) icerik. */
function templateContent(product: Product): GeneratedContent {
  const link = productUrl(product);
  const name = product.title || "Bu sik parca";
  const base = `${name} 😍 Gardirobunu yenilemenin tam zamani!`;

  const captions: Record<Platform, string> = {
    tiktok: `${base}\n\n👉 Detaylar profildeki linkte\n${link}\n#moda #giyim #trend #stil #kombin`,
    instagram: `${base}\n\nBegendin mi? Linke goz at 👀\n${link}\n#moda #outfit #style #fashion #giyim`,
    facebook: `${base}\n\nUrune ulasmak icin: ${link}`,
    youtube: `${name} | Kisa Tanitim\n\nDetaylar ve satin alma: ${link}\n#shorts #moda #giyim`,
    pinterest: `${name} - ilham veren kombin fikirleri. Detaylar icin tikla 👉 ${link}`,
  };

  const videoPrompt =
    `Cinematic 9:16 vertical short fashion advertisement. The clothing item "${name}" ` +
    `is showcased with smooth camera motion, soft studio lighting, subtle fabric movement, ` +
    `and an aspirational, trendy mood. Slow zoom, elegant transitions, high-end look. ` +
    `No text overlays.`;

  return { videoPrompt, captions };
}

/** OpenAI uyumlu chat completions cagrisi (JSON cikti). */
async function llmContent(product: Product): Promise<GeneratedContent> {
  const link = productUrl(product);
  const sys =
    "Sen bir sosyal medya ve kisa video reklam metni uzmanisin. Verilen giyim urunu icin " +
    "her platforma uygun, albenili, kisa aciklamalar ve gorselden videoya (image-to-video) " +
    "uygun bir ingilizce video prompt uretirsin. Yanit SADECE gecerli JSON olmali.";

  const user = `Urun basligi: ${product.title}
Urun aciklamasi: ${product.description || "(yok)"}
Site urun linki (her aciklamanin sonuna dogal sekilde eklenmeli): ${link}

Su JSON semasinda yanit ver:
{
  "videoPrompt": "image-to-video icin ingilizce, 9:16 dikey, sinematik moda reklami prompt'u (metin overlay yok)",
  "captions": {
    "tiktok": "TR aciklama + emoji + 4-5 hashtag + link",
    "instagram": "TR aciklama + emoji + 4-5 hashtag + link",
    "facebook": "TR kisa aciklama + link",
    "youtube": "TR baslik/aciklama + #shorts + link",
    "pinterest": "TR ilham verici kisa aciklama + link"
  }
}`;

  const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.llm.apiKey}`,
    },
    body: JSON.stringify({
      model: config.llm.model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });

  if (!res.ok) throw new Error(`LLM hata: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  const captions = {} as Record<Platform, string>;
  for (const p of [...VIDEO_PLATFORMS, ...IMAGE_PLATFORMS]) {
    captions[p] = parsed?.captions?.[p] ?? templateContent(product).captions[p];
  }
  return {
    videoPrompt: parsed?.videoPrompt ?? templateContent(product).videoPrompt,
    captions,
  };
}

export async function generateContent(product: Product): Promise<GeneratedContent> {
  if (config.llm.enabled) {
    try {
      return await llmContent(product);
    } catch (err) {
      console.error("LLM icerik uretimi basarisiz, sablona dusuluyor:", err);
    }
  }
  return templateContent(product);
}
