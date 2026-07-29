"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/db/types";

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this product and all related assets?")) return;
    setBusy(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <p className="text-neutral-600">No products yet.</p>
        <Link
          href="/admin/urun-ekle"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Added</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="line-clamp-2 max-w-xs font-medium text-neutral-800">{p.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-neutral-600">{p.price ?? "-"}</td>
              <td className="px-4 py-3 text-neutral-500">
                {new Date(p.createdAt).toLocaleDateString("en-US")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/urun/${p.id}`}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Studio
                  </Link>
                  <button
                    onClick={() => remove(p.id)}
                    disabled={busy === p.id}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
