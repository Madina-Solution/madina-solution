import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  Package,
  Shield,
  ChevronRight,
  MessageCircle,
  Check,
  UserCircle,
} from "lucide-react";
import { db } from "@/db";
import { products, categories, reviews, users } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { BRAND } from "@/lib/constants";
import { ProductGallery } from "./product-gallery";
import { SiteImage } from "@/components/ui/site-image";
import { ProductConfiguration } from "./product-configuration";
import { RelatedProducts } from "./related-products";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/json-ld";
import { AdSenseUnit } from "@/components/ads/adsense";
import { getPublicSiteConfig } from "@/lib/site-config";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await db
    .select({
      name: products.name,
      shortDescription: products.shortDescription,
      thumbnail: products.thumbnail,
    })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product[0]) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  return buildPageMetadata({ title: product[0].name, description: product[0].shortDescription || `${product[0].name} - Madina Solution`, path: `/products/${encodeURIComponent(slug)}`, image: product[0].thumbnail || undefined });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch product with category
  const productResult = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      description: products.description,
      thumbnail: products.thumbnail,
      gallery: products.gallery,
      basePrice: products.basePrice,
      unit: products.unit,
      minOrder: products.minOrder,
      specifications: products.specifications,
      options: products.options,
      productionDays: products.productionDays,
      isFeatured: products.isFeatured,
      rating: products.rating,
      reviewCount: products.reviewCount,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  const product = productResult[0];

  if (!product) {
    notFound();
  }

  // Fetch reviews for this product
  const productReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      images: reviews.images,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(5);

  // Fetch related products (same category)
  const relatedProducts = product.categoryId
    ? await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          thumbnail: products.thumbnail,
          basePrice: products.basePrice,
          unit: products.unit,
          rating: products.rating,
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, product.categoryId),
            ne(products.id, product.id),
            eq(products.isActive, true)
          )
        )
        .limit(4)
    : [];

  const specs = product.specifications as Record<string, string> || {};
  const gallery = (product.gallery as string[]) || [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://madinasolution.web.app";
  const siteConfig = await getPublicSiteConfig();

  return (
    <>
    <ProductSchema
      name={product.name}
      description={product.shortDescription || product.description || product.name}
      price={Number(product.basePrice)}
      url={`${siteUrl}/products/${product.slug}`}
      image={product.thumbnail || undefined}
      rating={Number(product.rating) || undefined}
      reviewCount={product.reviewCount || undefined}
    />
    <BreadcrumbSchema
      items={[
        { name: "Home", url: siteUrl },
        { name: "Products", url: `${siteUrl}/products` },
        ...(product.categoryName ? [{ name: product.categoryName, url: `${siteUrl}/products/category/${product.categorySlug}` }] : []),
        { name: product.name, url: `${siteUrl}/products/${product.slug}` },
      ]}
    />
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-dark-500">
          <Link href="/" className="hover:text-primary">
            Beranda
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary">
            Produk
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/products/category/${product.categorySlug}`}
                className="hover:text-primary"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-dark">{product.name}</span>
        </nav>

        {/* Main Content */}
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <ProductGallery
            thumbnail={product.thumbnail}
            gallery={gallery}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="min-w-0">
            {/* Category & Featured Badge */}
            <div className="flex items-center gap-2">
              {product.categoryName && (
                <Badge variant="secondary">{product.categoryName}</Badge>
              )}
              {product.isFeatured && <Badge variant="default">Featured</Badge>}
            </div>

            {/* Title */}
            <h1 className="mt-3 break-words text-3xl font-bold leading-tight text-dark lg:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(Number(product.rating) || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-dark-200 text-dark-200"
                    }`}
                  />
                ))}
                <span className="ml-1 font-medium">
                  {product.rating || "0"}
                </span>
              </div>
              <span className="text-dark-400">
                ({product.reviewCount || 0} ulasan)
              </span>
            </div>

            {/* Price */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(Number(product.basePrice))}
                </span>
                <span className="text-lg text-dark-500">
                  /{product.unit || "pcs"}
                </span>
              </div>
              {product.minOrder && product.minOrder > 1 && (
                <p className="mt-1 text-sm text-dark-500">
                  Minimal pemesanan: {product.minOrder} {product.unit}
                </p>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="mt-4 text-dark-600">{product.shortDescription}</p>
            )}

            <Separator className="my-6" />

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-dark-500">Estimasi Pengerjaan</p>
                  <p className="font-semibold text-dark">
                    {product.productionDays || 3} hari kerja
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-dark-500">Garansi</p>
                  <p className="font-semibold text-dark">Kualitas Terjamin</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Configuration */}
            <ProductConfiguration
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              productThumbnail={product.thumbnail}
              basePrice={Number(product.basePrice)}
              unit={product.unit || "pcs"}
              minOrder={product.minOrder || 1}
              options={product.options || []}
            />

            {/* Actions are rendered inside ProductConfiguration */}

            {/* WhatsApp */}
            <Button
              variant="secondary"
              size="lg"
              className="mt-3 w-full"
              asChild
            >
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=Halo%20Madina%20Solution%2C%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Tanya via WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Description */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-dark">
                  Deskripsi Produk
                </h2>
                <div className="mt-4 prose prose-dark max-w-none">
                  <p className="text-dark-600 whitespace-pre-wrap">
                    {product.description || product.shortDescription || "Tidak ada deskripsi tersedia."}
                  </p>
                </div>

                {/* Specifications */}
                {Object.keys(specs).length > 0 && (
                  <>
                    <h3 className="mt-8 text-lg font-semibold text-dark">
                      Spesifikasi
                    </h3>
                    <div className="mt-4 space-y-3">
                      {Object.entries(specs).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between border-b border-dark-100 pb-3"
                        >
                          <span className="text-dark-500 capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-medium text-dark">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-dark">Ulasan</h2>
                  <Badge variant="secondary">
                    {product.reviewCount || 0} ulasan
                  </Badge>
                </div>

                {productReviews.length > 0 ? (
                  <div className="mt-6 space-y-6">
                    {productReviews.map((review) => (
                      <div key={review.id} className="border-b border-dark-100 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          {review.userAvatar ? <SiteImage src={review.userAvatar} alt={review.userName || "Pengguna"} width={40} height={40} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true"><UserCircle className="h-5 w-5" /></div>}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-dark">
                                {review.userName || "Pengguna"}
                              </span>
                              {review.isVerified && (
                                <Badge variant="success" className="text-xs">
                                  <Check className="mr-1 h-3 w-3" />
                                  Terverifikasi
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-dark-200 text-dark-200"
                                  }`}
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-dark-600">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 text-center py-8">
                    <p className="text-dark-500">
                      Belum ada ulasan untuk produk ini.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-dark">Informasi Pengiriman</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-dark">Pengiriman</p>
                      <p className="text-sm text-dark-500">
                        Tersedia pengiriman ke seluruh Indonesia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-dark">Estimasi</p>
                      <p className="text-sm text-dark-500">
                        {product.productionDays || 3} hari pengerjaan + ongkir
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-dark">Butuh Bantuan?</h3>
                <p className="mt-2 text-sm text-dark-600">
                  Tim kami siap membantu konsultasi kebutuhan cetak Anda.
                </p>
                <Button className="mt-4 w-full" asChild>
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Hubungi Kami
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product ad: optional, separated from purchase controls */}
        {siteConfig.adsEnabled && siteConfig.adsClient && siteConfig.adsSlots.product ? (
          <div className="mt-10"><AdSenseUnit client={siteConfig.adsClient} slot={siteConfig.adsSlots.product} className="mx-auto max-w-4xl" label="Iklan" /></div>
        ) : null}

        {/* Related Products */}
        {relatedProducts.length > 0 ? <RelatedProducts products={relatedProducts} /> : null}
      </div>
    </div>
    </>
  );
}
