import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Affiliate yonlendirmesi + tiklama logu.
 * /git/[id] -> tiklama kaydedilir -> Amazon affiliate URL'ine 302 redirect.
 * Seffaf yonlendirme (cloaking degil): kullanici Amazon'a gittigini gorur.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const repo = getRepository();
  const product = await repo.getProduct(params.id);

  if (!product) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Hangi platformdan/kaynaktan geldigini yakala (utm_source veya referer)
  const url = new URL(req.url);
  const source =
    url.searchParams.get("utm_source") ??
    url.searchParams.get("ref") ??
    req.headers.get("referer") ??
    null;

  try {
    await repo.recordClick({
      productId: product.id,
      referrer: source,
      isAffiliate: true,
    });
  } catch {
    // Tiklama loglanamazsa bile kullaniciyi yonlendirmeye devam et.
  }

  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}
