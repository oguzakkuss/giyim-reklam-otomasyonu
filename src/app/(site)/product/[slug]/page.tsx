import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRepository } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { AdSlot } from "@/components/AdSlot";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

interface Params {
  params: { slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getRepository().getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 155),
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const repo = getRepository();
  const product = await repo.getProductBySlug(params.slug);
  if (!product) notFound();

  const all = await repo.listProducts();
  const related = all.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container-max py-8">
      <AdSlot slot={config.adsense.slotTop} label="Advertisement" className="mb-8" />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full max-h-[560px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{product.title}</h1>
          {product.price && (
            <div className="mt-3 text-2xl font-black text-brand-600">{product.price}</div>
          )}
          <p className="mt-5 whitespace-pre-line leading-relaxed text-neutral-600">
            {product.description || "More information about this product is coming soon."}
          </p>

          <a
            href={`/git/${product.id}`}
            rel="nofollow sponsored noopener"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-brand-700"
          >
            View on Amazon
          </a>
          <p className="mt-3 text-xs text-neutral-400">
            This is an affiliate link. As an Amazon Associate, we earn from
            qualifying purchases at no additional cost to you.
          </p>

          <div className="mt-8">
            <AdSlot slot={config.adsense.slotInline} label="Advertisement" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
