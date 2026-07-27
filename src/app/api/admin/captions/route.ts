import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import type { Platform } from "@/lib/db/types";

export async function POST(req: NextRequest) {
  const { productId, platform, text } = await req.json().catch(() => ({}));
  if (!productId || !platform) {
    return NextResponse.json({ error: "productId ve platform gerekli" }, { status: 400 });
  }
  const caption = await getRepository().upsertCaption(productId, platform as Platform, text ?? "");
  return NextResponse.json(caption);
}
