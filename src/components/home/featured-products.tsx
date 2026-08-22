import Link from "next/link";
import { ArrowRight, Star, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function FeaturedProducts() {
  const productList = await db
    .select({
      id: products.id, name: products.name, slug: products.slug,
      basePrice: products.basePrice, unit: products.unit,
      rating: products.rating, reviewCount: products.reviewCount,
      isFeatured: products.isFeatured, categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.isFeatured), desc(products.createdAt))
    .limit(6);

  if (productList.length === 0) return null;

  return (
    <section className="bg-dark-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Produk Unggulan</span>
            <h2 className="mt-3 text-3xl font-bold text-dark sm:text-4xl">Produk Terlaris Kami</h2>
            <p className="mt-2 text-dark-600">Pilihan produk favorit pelanggan dengan kualitas terbaik</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">Semua Produk<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group h-full overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl font-bold text-dark-300">{product.name.charAt(0)}</span>
                  </div>
                  {product.isFeatured && <Badge className="absolute left-3 top-3" variant="default">Featured</Badge>}
                  <div className="absolute inset-0 bg-dark/0 transition-colors group-hover:bg-dark/10" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-dark-500">{product.categoryName || "Produk"}</p>
                  <h3 className="mt-1 font-semibold text-dark group-hover:text-primary">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating || "0"}</span>
                    <span className="text-sm text-dark-400">({product.reviewCount || 0} ulasan)</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">{formatCurrency(Number(product.basePrice))}</span>
                    <span className="text-sm text-dark-500">/{product.unit || "pcs"}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
