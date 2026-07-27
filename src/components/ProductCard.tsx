import Link from "next/link";
import type { Product } from "@/lib/db/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-800">{product.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          {product.price ? (
            <span className="text-base font-bold text-brand-600">{product.price}</span>
          ) : (
            <span className="text-sm text-neutral-400">Fiyati gor</span>
          )}
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
            Incele
          </span>
        </div>
      </div>
    </Link>
  );
}
