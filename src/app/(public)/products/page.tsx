import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { desc, eq, and, gte, lte, ilike, asc, or } from "drizzle-orm";
import { productSearchParamsSchema } from "@/lib/validations/product";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Produk",
  description:
    "Katalog produk cetak Madina Solution: banner, sticker, kartu nama, brosur, undangan, dan berbagai kebutuhan cetak bisnis.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function getProducts(searchParams: Record<string, string | string[] | undefined>) {
  // Validate and parse search params
  const rawParams = {
    category: typeof searchParams.category === "string" ? searchParams.category : undefined,
    minPrice: typeof searchParams.minPrice === "string" ? searchParams.minPrice : undefined,
    maxPrice: typeof searchParams.maxPrice === "string" ? searchParams.maxPrice : undefined,
    featured: typeof searchParams.featured === "string" ? searchParams.featured : undefined,
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
  };

  const parsed = productSearchParamsSchema.safeParse(rawParams);
  const params = parsed.success ? parsed.data : {};

  // Build where conditions
  const conditions = [eq(products.isActive, true)];

  // Category filter
  if (params.category) {
    const category = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.slug, params.category), eq(categories.isActive, true)))
      .limit(1);

    if (category[0]) {
      conditions.push(eq(products.categoryId, category[0].id));
    }
  }

  // Price filter
  if (params.minPrice !== undefined) {
    conditions.push(gte(products.basePrice, String(params.minPrice)));
  }
  if (params.maxPrice !== undefined) {
    conditions.push(lte(products.basePrice, String(params.maxPrice)));
  }

  // Featured filter
  if (params.featured === "true") {
    conditions.push(eq(products.isFeatured, true));
  }

  // Search query
  if (params.q) {
    const searchTerm = `%${params.q}%`;
    conditions.push(
      or(
        ilike(products.name, searchTerm),
        ilike(products.shortDescription, searchTerm)
      )!
    );
  }

  // Build order by
  let orderBy;
  switch (params.sort) {
    case "price-asc":
      orderBy = asc(products.basePrice);
      break;
    case "price-desc":
      orderBy = desc(products.basePrice);
      break;
    case "oldest":
      orderBy = asc(products.createdAt);
      break;
    case "popular":
      orderBy = desc(products.reviewCount);
      break;
    case "rating":
      orderBy = desc(products.rating);
      break;
    case "newest":
    default:
      orderBy = desc(products.createdAt);
      break;
  }

  // Execute query
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      basePrice: products.basePrice,
      unit: products.unit,
      rating: products.rating,
      reviewCount: products.reviewCount,
      isFeatured: products.isFeatured,
      thumbnail: products.thumbnail,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(products.isFeatured), orderBy);

  return { products: productList, params };
}

async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.name));
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const [{ products: productList, params }, categoryList] = await Promise.all([
    getProducts(resolvedParams),
    getCategories(),
  ]);

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Katalog Produk
          </span>
          <h1 className="mt-3 text-4xl font-bold text-dark">
            Produk Cetak Kami
          </h1>
          <p className="mt-2 text-dark-600">
            Berbagai pilihan produk cetak berkualitas untuk kebutuhan bisnis
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<FilterSkeleton />}>
              <ProductFilters
                categories={categoryList}
                currentParams={params}
              />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid
                products={productList}
                currentParams={params}
                totalCount={productList.length}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full" />
      ))}
    </div>
  );
}
