import { getRepository } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { AdSlot } from "@/components/AdSlot";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const products = await getRepository().listProducts();

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-neutral-50">
        <div className="container-max py-14 text-center sm:py-20">
          <span className="inline-flex rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-600 shadow-sm">
            Today&apos;s Edit
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">
            Your next favorite look starts here
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            Explore handpicked clothing, accessories, and standout pieces worth adding
            to your wardrobe.
          </p>
        </div>
      </section>

      <div className="container-max py-8">
        <AdSlot slot={config.adsense.slotTop} label="Advertisement" className="mb-8" />

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-neutral-700">New finds are coming soon</h2>
            <p className="mt-2 text-sm text-neutral-500">
              We&apos;re preparing our first curated fashion collection. Check back shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {products.length > 8 && (
              <>
                <AdSlot slot={config.adsense.slotInline} label="Advertisement" className="my-8" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.slice(8).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
