import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const repo = getRepository();
  const product = await repo.getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Bulunamadi" }, { status: 404 });
  const [asset, captions, posts] = await Promise.all([
    repo.getAsset(params.id),
    repo.listCaptions(params.id),
    repo.listPosts(params.id),
  ]);
  return NextResponse.json({ product, asset, captions, posts });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await getRepository().deleteProduct(params.id);
  return NextResponse.json({ ok: true });
}
