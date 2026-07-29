import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductStudio } from "@/components/admin/ProductStudio";

export const dynamic = "force-dynamic";

export default async function ProductStudioPage({ params }: { params: { id: string } }) {
  const repo = getRepository();
  const product = await repo.getProduct(params.id);
  if (!product) notFound();

  const [asset, captions, posts] = await Promise.all([
    repo.getAsset(params.id),
    repo.listCaptions(params.id),
    repo.listPosts(params.id),
  ]);

  return (
    <AdminShell>
      <div className="mb-6 flex items-center gap-3 text-sm text-neutral-500">
        <Link href="/admin" className="hover:text-brand-600">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-neutral-800">Studio</span>
      </div>
      <ProductStudio initial={{ product, asset, captions, posts }} />
    </AdminShell>
  );
}
