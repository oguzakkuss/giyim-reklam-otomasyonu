import { getRepository } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

function normalizeReferrer(ref: string | null): string {
  if (!ref) return "direct / unknown";
  const r = ref.toLowerCase();
  if (r.includes("tiktok")) return "TikTok";
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("facebook") || r.includes("fb.")) return "Facebook";
  if (r.includes("youtube") || r.includes("youtu.be")) return "YouTube";
  if (r.includes("pinterest") || r.includes("pin.it")) return "Pinterest";
  try {
    return new URL(ref).hostname.replace("www.", "");
  } catch {
    return ref;
  }
}

export default async function AnalyticsPage() {
  const repo = getRepository();
  const [clicks, products] = await Promise.all([repo.listClicks(), repo.listProducts()]);

  const total = clicks.length;
  const byProduct = new Map<string, number>();
  const bySource = new Map<string, number>();
  for (const c of clicks) {
    byProduct.set(c.productId, (byProduct.get(c.productId) ?? 0) + 1);
    const s = normalizeReferrer(c.referrer);
    bySource.set(s, (bySource.get(s) ?? 0) + 1);
  }

  const topProducts = [...byProduct.entries()]
    .map(([id, count]) => ({ product: products.find((p) => p.id === id), count }))
    .filter((x) => x.product)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1]);
  const maxSource = sources[0]?.[1] ?? 1;

  return (
    <AdminShell>
      <h1 className="mb-1 text-2xl font-bold text-neutral-900">Analytics</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Affiliate click tracking (our own logs).{" "}
        {config.analytics.gaId
          ? "GA4 is active."
          : "GA4 is inactive (add NEXT_PUBLIC_GA_MEASUREMENT_ID)."}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total clicks" value={total} />
        <StatCard label="Products" value={products.length} />
        <StatCard label="Traffic sources" value={sources.length} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-neutral-800">Top clicked products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">No clicks yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map(({ product, count }) => (
                <li key={product!.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product!.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="line-clamp-1 flex-1 text-sm text-neutral-700">{product!.title}</span>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {count} clicks
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-neutral-800">Traffic sources</h2>
          {sources.length === 0 ? (
            <p className="text-sm text-neutral-500">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {sources.map(([source, count]) => (
                <li key={source}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-neutral-700">{source}</span>
                    <span className="font-medium text-neutral-500">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(count / maxSource) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="text-3xl font-black text-neutral-900">{value}</div>
      <div className="mt-1 text-sm text-neutral-500">{label}</div>
    </div>
  );
}
