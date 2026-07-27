import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { buildAffiliateUrl } from "@/lib/amazon";

const schema = z.object({
  amazonUrl: z.string().url(),
  title: z.string().min(1),
  description: z.string().default(""),
  imageUrl: z.string().url(),
  price: z.string().nullable().optional(),
  affiliateUrl: z.string().url().optional(),
});

export async function GET() {
  const products = await getRepository().listProducts();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const product = await getRepository().createProduct({
    amazonUrl: d.amazonUrl,
    affiliateUrl: d.affiliateUrl ?? buildAffiliateUrl(d.amazonUrl),
    title: d.title,
    description: d.description ?? "",
    imageUrl: d.imageUrl,
    price: d.price ?? null,
  });
  return NextResponse.json(product, { status: 201 });
}
