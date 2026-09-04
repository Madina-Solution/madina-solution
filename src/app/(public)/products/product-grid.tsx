"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Star, ShoppingCart, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { SiteImage } from "@/components/ui/site-image";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import type { ProductSearchParams } from "@/lib/validations/product";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: string;
  unit: string | null;
  rating: string | null;
  reviewCount: number | null;
  isFeatured: boolean | null;
  thumbnail: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

type Props = {
  products: Product[];
  currentParams: Partial<ProductSearchParams>;
  totalCount: number;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" },
  { value: "popular", label: "Terpopuler" },
  { value: "rating", label: "Rating Tertinggi" },
];

export function ProductGrid({ products, currentParams, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentSort = currentParams.sort || "newest";

  return (
    <div>
      {/* Header with count and sort */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-dark-600">
          Menampilkan <span className="font-semibold text-dark">{totalCount}</span> produk
          {currentParams.q && (
            <span>
              {" "}untuk &quot;<span className="font-semibold text-primary">{currentParams.q}</span>&quot;
            </span>
          )}
          {currentParams.category && (
            <span>
              {" "}di kategori <span className="font-semibold text-primary">{currentParams.category}</span>
            </span>
          )}
        </p>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-dark-500">Urutkan:</span>
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-xl border border-dark-200 bg-white px-3 py-2 text-sm font-medium text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:shadow-premium-lg">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
                  {product.thumbnail ? (
                    <SiteImage
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <MediaPlaceholder />
                  )}
                  {product.isFeatured && (
                    <Badge className="absolute left-3 top-3" variant="default">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-dark/0 transition-colors group-hover:bg-dark/10" />
                  <Button
                    size="icon"
                    className="absolute bottom-3 right-3 opacity-0 transition-all group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      // Navigate to product detail for configuration
                      window.location.href = `/products/${product.slug}`;
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-dark-500">
                    {product.categoryName || "Uncategorized"}
                  </p>
                  <h3 className="mt-1 font-semibold text-dark group-hover:text-primary">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="mt-1 line-clamp-2 text-sm text-dark-500">
                      {product.shortDescription}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {product.rating || "0"}
                      </span>
                    </div>
                    <span className="text-sm text-dark-400">
                      ({product.reviewCount || 0} ulasan)
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(Number(product.basePrice))}
                    </span>
                    <span className="text-sm text-dark-500">
                      /{product.unit || "pcs"}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dark-100 bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dark-100">
            <Package className="h-8 w-8 text-dark-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-dark">
            Tidak Ada Produk
          </h3>
          <p className="mt-2 text-dark-500">
            {currentParams.q || currentParams.category
              ? "Tidak ada produk yang sesuai dengan filter Anda."
              : "Belum ada produk tersedia saat ini."}
          </p>
          {(currentParams.q || currentParams.category) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/products")}
            >
              Reset Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
