import { config } from "@/lib/config";
import { VIDEO_PLATFORMS, IMAGE_PLATFORMS, type Platform, type Product } from "@/lib/db/types";

export interface GeneratedContent {
  videoPrompt: string;
  captions: Record<Platform, string>;
}

function productUrl(product: Product): string {
  return `${config.site.url}/product/${product.slug}`;
}

/** LLM yoksa kullanilacak sablon tabanli (mock) icerik. */
function templateContent(product: Product): GeneratedContent {
  const link = productUrl(product);
  const name = product.title || "This standout piece";
  const base = `${name} 😍 A fresh find for your wardrobe.`;

  const captions: Record<Platform, string> = {
    tiktok: `${base}\n\n👉 See the full details:\n${link}\n#fashion #style #outfit #fashionfinds #wardrobe`,
    instagram: `${base}\n\nWould you wear it? Take a closer look 👀\n${link}\n#fashion #outfit #style #fashionfinds #shopping`,
    facebook: `${base}\n\nView the product details: ${link}`,
    youtube: `${name} | Fashion Find\n\nProduct details: ${link}\n#shorts #fashion #style`,
    pinterest: `${name} — a stylish addition to your wardrobe. See the details 👉 ${link}`,
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
    "You are a US fashion social media copywriter. Create concise, engaging, honest " +
    "English captions tailored to each platform and an English image-to-video prompt. " +
    "Do not invent product claims, discounts, materials, or features. Return ONLY valid JSON.";

  const user = `Product title: ${product.title}
Product description: ${product.description || "(none)"}
Product page URL (include naturally in every caption): ${link}

Return this JSON schema:
{
  "videoPrompt": "English image-to-video prompt for a vertical 9:16 cinematic fashion showcase, with no text overlays",
  "captions": {
    "tiktok": "US English caption + emoji + 4-5 relevant hashtags + link",
    "instagram": "US English caption + emoji + 4-5 relevant hashtags + link",
    "facebook": "Short US English caption + link",
    "youtube": "US English title/description + #shorts + link",
    "pinterest": "Short, inspirational US English description + link"
  }
}`;

  const payload: Record<string, unknown> = {
    model: config.llm.model,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.8,
  };
  // Some OpenAI-compatible providers (e.g. NVIDIA NIM) reject response_format.
  if (!config.llm.baseUrl.includes("nvidia.com")) {
    payload.response_format = { type: "json_object" };
  }

  const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.llm.apiKey}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`LLM hata: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = parseJsonContent(raw);

  const fallback = templateContent(product);
  const parsedCaptions =
    parsed.captions && typeof parsed.captions === "object"
      ? (parsed.captions as Partial<Record<Platform, string>>)
      : {};
  const captions = {} as Record<Platform, string>;
  for (const p of [...VIDEO_PLATFORMS, ...IMAGE_PLATFORMS]) {
    captions[p] = parsedCaptions[p] ?? fallback.captions[p];
  }
  return {
    videoPrompt:
      typeof parsed.videoPrompt === "string" && parsed.videoPrompt.trim()
        ? parsed.videoPrompt
        : fallback.videoPrompt,
    captions,
  };
}

function parseJsonContent(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return JSON.parse(fenced[1].trim());
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("LLM JSON parse failed");
  }
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
