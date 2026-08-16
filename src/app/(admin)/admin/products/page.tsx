import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      unit: products.unit,
      isFeatured: products.isFeatured,
      isActive: products.isActive,
      categoryName: categories.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Produk</h1>
          <p className="mt-1 text-dark-500">{productList.length} produk</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dark-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 text-left">
                <th className="px-6 py-3 font-medium text-dark-500">Produk</th>
                <th className="px-6 py-3 font-medium text-dark-500">Kategori</th>
                <th className="px-6 py-3 text-right font-medium text-dark-500">Harga</th>
                <th className="px-6 py-3 font-medium text-dark-500">Status</th>
                <th className="px-6 py-3 font-medium text-dark-500">Unggulan</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id} className="border-b border-dark-50 transition-colors hover:bg-dark-50/50 last:border-0">
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${product.id}`} className="font-semibold text-dark hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="text-xs text-dark-400">/{product.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-dark-600">{product.categoryName || "—"}</td>
                  <td className="px-6 py-4 text-right font-medium text-dark">
                    {formatCurrency(Number(product.basePrice))}/{product.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.isFeatured && (
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Featured
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
