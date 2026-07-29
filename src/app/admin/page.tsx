import Link from "next/link";
import { getRepository, usingSupabase } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductTable } from "@/components/admin/ProductTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const products = await getRepository().listProducts();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500">
            {products.length} products · Data store: {usingSupabase() ? "Supabase" : "Local JSON (dev)"}
          </p>
        </div>
        <Link
          href="/admin/urun-ekle"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>
      <ProductTable products={products} />
    </AdminShell>
  );
}
