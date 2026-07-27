import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import type { Platform, PostStatus } from "@/lib/db/types";

/** Post durumunu gunceller (onayla/reddet vb.). */
export async function POST(req: NextRequest) {
  const { productId, platform, status } = await req.json().catch(() => ({}));
  if (!productId || !platform || !status) {
    return NextResponse.json({ error: "productId, platform, status gerekli" }, { status: 400 });
  }
  const post = await getRepository().upsertPost(productId, platform as Platform, {
    status: status as PostStatus,
  });
  return NextResponse.json(post);
}
