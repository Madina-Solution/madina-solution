import { SiteImage } from "@/components/ui/site-image";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { approvedReviewAverage, approvedReviewCount } from "@/lib/review-stats";
import { eq, desc } from "drizzle-orm";

export async function FeaturedProducts() {
  const reviewCountExpr = approvedReviewCount(products.id);
  const reviewAverageExpr = approvedReviewAverage(products.id);
  const productList = await db.select({ id: products.id, name: products.name, slug: products.slug, thumbnail: products.thumbnail, basePrice: products.basePrice, unit: products.unit, rating: reviewAverageExpr, reviewCount: reviewCountExpr, isFeatured: products.isFeatured, categoryName: categories.name }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.isActive, true)).orderBy(desc(products.isFeatured), desc(products.createdAt)).limit(6);
  if (productList.length === 0) return null;
  return (
    <section className="section-shell bg-[#F4F1EB] py-20 lg:py-28">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl"><span className="eyebrow">Produk Unggulan</span><h2 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-dark-900 sm:text-4xl lg:text-5xl">Pilihan yang siap membuat brand lebih berkelas.</h2><p className="mt-4 text-dark-600">Produk favorit pelanggan dengan kualitas yang dapat dipesan langsung.</p></div>
          <Button variant="outline" asChild><Link href="/products">Lihat Semua<ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="h-full overflow-hidden bg-white/95">
                <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
                  {product.thumbnail ? <SiteImage src={product.thumbnail} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <MediaPlaceholder label="Belum ada media" />}
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between"><Badge className="border-white/15 bg-black/55 text-white backdrop-blur">{product.categoryName || "Produk"}</Badge>{product.isFeatured && <Badge variant="default">Unggulan</Badge>}</div>
                </div>
                <div className="p-5 lg:p-6">
                  <h3 className="font-semibold tracking-tight text-dark-900 group-hover:text-primary">{product.name}</h3>
                  <div className="mt-3 flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-semibold text-dark-800">{product.rating || "—"}</span><span className="text-dark-400">· {product.reviewCount || 0} ulasan</span></div>
                  <div className="mt-5 flex items-end justify-between gap-3"><p className="font-bold text-primary">Mulai {formatCurrency(Number(product.basePrice))}<span className="ml-1 text-xs font-normal text-dark-400">/{product.unit}</span></p><span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dark-200 text-dark-500 transition-colors group-hover:border-primary group-hover:text-primary"><ArrowUpRight className="h-4 w-4" /></span></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
