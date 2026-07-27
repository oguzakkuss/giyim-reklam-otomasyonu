import crypto from "crypto";
import { config } from "@/lib/config";

/**
 * Amazon yardimcilari:
 *  - Linkten ASIN cikarma
 *  - Affiliate (Associates) etiketli temiz URL uretme
 *  - (Opsiyonel) PA-API v5 GetItems ile baslik/gorsel/fiyat cekme
 *
 * ONEMLI: Gorselleri yasal kullanmak icin PA-API onerilir. Scraping, Amazon
 * kullanim sartlarini ihlal edebilir. PA-API anahtari yoksa admin gorseli
 * elle girer.
 */

export interface AmazonProduct {
  asin: string | null;
  title: string;
  imageUrl: string;
  price: string | null;
  affiliateUrl: string;
}

export function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "amazon.com";
  }
}

export function buildAffiliateUrl(url: string): string {
  const tag = config.amazon.associateTag;
  const asin = extractAsin(url);
  const domain = domainFromUrl(url);
  if (asin) {
    const base = `https://www.${domain}/dp/${asin}`;
    return tag ? `${base}?tag=${encodeURIComponent(tag)}` : base;
  }
  // ASIN bulunamazsa orijinal URL'e tag ekle
  if (!tag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}

/* ---------------------------- PA-API v5 (SigV4) --------------------------- */

function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function hmac(key: crypto.BinaryLike | Buffer, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

async function paapiGetItems(asin: string): Promise<AmazonProduct | null> {
  const { paapiAccessKey, paapiSecretKey, paapiHost, paapiRegion, associateTag } = config.amazon;
  if (!paapiAccessKey || !paapiSecretKey || !associateTag) return null;

  const service = "ProductAdvertisingAPI";
  const target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";
  const path = "/paapi5/getitems";
  const endpoint = `https://${paapiHost}${path}`;

  const marketplace = `www.${paapiHost.replace("webservices.", "")}`;
  const payload = JSON.stringify({
    ItemIds: [asin],
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
    PartnerTag: associateTag,
    PartnerType: "Associates",
    Marketplace: marketplace,
  });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${paapiHost}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;
  const signedHeaders = "content-encoding;host;x-amz-date;x-amz-target";
  const canonicalRequest = [
    "POST",
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${paapiRegion}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${paapiSecretKey}`, dateStamp);
  const kRegion = hmac(kDate, paapiRegion);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  const authorization =
    `${algorithm} Credential=${paapiAccessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: paapiHost,
      "x-amz-date": amzDate,
      "x-amz-target": target,
      Authorization: authorization,
    },
    body: payload,
  });

  if (!res.ok) {
    throw new Error(`PA-API hata: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const item = data?.ItemsResult?.Items?.[0];
  if (!item) return null;

  return {
    asin,
    title: item.ItemInfo?.Title?.DisplayValue ?? "",
    imageUrl: item.Images?.Primary?.Large?.URL ?? "",
    price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount ?? null,
    affiliateUrl: item.DetailPageURL ?? buildAffiliateUrl(`https://${marketplace}/dp/${asin}`),
  };
}

/**
 * Amazon urun verisini getirir. PA-API varsa gercek veri, yoksa yalnizca
 * affiliate URL + ASIN doner (baslik/gorsel/fiyat admin tarafindan girilir).
 */
export async function fetchAmazonProduct(url: string): Promise<AmazonProduct> {
  const asin = extractAsin(url);
  const affiliateUrl = buildAffiliateUrl(url);

  if (config.amazon.paapiEnabled && asin) {
    try {
      const data = await paapiGetItems(asin);
      if (data) return data;
    } catch (err) {
      console.error("PA-API cagrisi basarisiz, manuel girise dusuluyor:", err);
    }
  }

  return { asin, title: "", imageUrl: "", price: null, affiliateUrl };
}
