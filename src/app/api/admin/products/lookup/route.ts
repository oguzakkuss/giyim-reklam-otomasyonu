import { NextRequest, NextResponse } from "next/server";
import { fetchAmazonProduct } from "@/lib/amazon";

/** Amazon linkinden veri onizleme (form prefill). */
export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: "" }));
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
  }
  try {
    const data = await fetchAmazonProduct(url);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 },
    );
  }
}
