import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  MessageCircle,
  MessageSquareQuote,
  Package,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserCircle,
} from "lucide-react";
import { db } from "@/db";
import { categories, products, reviews, users } from "@/db/schema";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";
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
import { getSession } from "@/lib/auth/session";
import { buildPageMetadata } from "@/lib/seo";
import { ReviewForm } from "./review-form";
import type { ProductAdminMetadata, ProductOption } from "@/db/schema";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await db
    .select({
      name: products.name,
      shortDescription: products.shortDescription,
      thumbnail: products.thumbnail,
      metadata: products.metadata,
    })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) return { title: "Produk Tidak Ditemukan" };
  const seo = (product.metadata as ProductAdminMetadata | null)?.seo;
  return buildPageMetadata({
    title: seo?.title || product.name,
    description: seo?.description || product.shortDescription || `${product.name} — Madina Solution`,
    path: `/products/${encodeURIComponent(slug)}`,
    image: seo?.ogImage || product.thumbnail || undefined,
    noIndex: !!seo?.noIndex,
    keywords: seo?.keywords || [],
  });
}

function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const starClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value.toFixed(1)} dari 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${starClass} ${index < Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-dark-100 text-dark-200"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://madinasolution.web.app";

  const [productResult, session, siteConfig] = await Promise.all([
    db
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
        metadata: products.metadata,
        productionDays: products.productionDays,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1),
    getSession(),
    getPublicSiteConfig(),
  ]);

  const product = productResult[0];
  if (!product) notFound();

  const [productReviews, ratingAgg, myReview, relatedProducts] = await Promise.all([
    db
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
      .limit(8),
    db
      .select({ avg: sql<string>`coalesce(avg(${reviews.rating}), 0)`, count: count() })
      .from(reviews)
      .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true))),
    session
      ? db
          .select({ rating: reviews.rating, comment: reviews.comment })
          .from(reviews)
          .where(and(eq(reviews.productId, product.id), eq(reviews.userId, session.userId)))
          .limit(1)
          .then(([review]) => review ?? null)
      : Promise.resolve(null),
    product.categoryId
      ? db
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
          .where(and(eq(products.categoryId, product.categoryId), ne(products.id, product.id), eq(products.isActive, true)))
          .limit(4)
      : Promise.resolve([]),
  ]);

  const liveRating = Number(ratingAgg[0]?.avg ?? 0);
  const liveReviewCount = ratingAgg[0]?.count ?? 0;
  const metadata = (product.metadata as ProductAdminMetadata | null) || {};
  const specs = (product.specifications as Record<string, string> | null) || {};
  const gallery = Array.from(new Set([
    ...(Array.isArray(product.gallery) ? (product.gallery as string[]) : []),
    metadata.content?.videoUrl || "",
    ...((metadata.variants?.attributes || []).flatMap((attribute) => attribute.values.map((value) => value.image || ""))),
  ].filter(Boolean)));
  const richDescription = sanitizeRichHtml(product.description || product.shortDescription || "");
  const stockStatus = metadata.stock?.status || "made_to_order";
  const unit = product.unit || "pcs";
  const variantOptions: ProductOption[] = metadata.variants?.enabled
    ? (metadata.variants.attributes || []).map((attr, index) => ({
        id: `variant_${product.id}_${index}`,
        name: attr.name,
        key: `variant_${index}_${attr.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        type: "radio",
        required: true,
        values: attr.values.map((value) => ({
          label: value.label,
          value: value.value,
          priceModifier: value.priceModifier,
          description: value.stock !== undefined ? `Stok varian: ${value.stock}` : undefined,
        })),
        displayOrder: index,
      }))
    : [];
  const allOptions = [...(product.options || []), ...variantOptions];
  const tieredPrices = [...(metadata.pricing?.wholesaleTiers || [])].sort((a, b) => a.minQuantity - b.minQuantity);
  const faq = metadata.content?.faq || [];
  const highlights = metadata.content?.highlights?.filter(Boolean) || [];
  const trust = metadata.trust || {};
  const trade = metadata.trade || {};
  const pageUrl = `${siteUrl}/products/${product.slug}`;

  return (
    <>
      <ProductSchema
        name={product.name}
        description={product.shortDescription || product.description || product.name}
        price={Number(product.basePrice)}
        url={pageUrl}
        image={product.thumbnail || undefined}
        sku={metadata.sku}
        availability={stockStatus === "out_of_stock" ? "OutOfStock" : "InStock"}
        rating={liveReviewCount > 0 ? liveRating : undefined}
        reviewCount={liveReviewCount > 0 ? liveReviewCount : undefined}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: siteUrl },
          { name: "Products", url: `${siteUrl}/products` },
          ...(product.categoryName ? [{ name: product.categoryName, url: `${siteUrl}/products/category/${product.categorySlug}` }] : []),
          { name: product.name, url: pageUrl },
        ]}
      />

      <main className="bg-[#fbfaf8] py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-dark-500">
            <Link href="/" className="hover:text-primary">Beranda</Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            <Link href="/products" className="hover:text-primary">Produk</Link>
            {product.categoryName && (
              <>
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                <Link href={`/products/category/${product.categorySlug}`} className="hover:text-primary">{product.categoryName}</Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate font-medium text-dark">{product.name}</span>
          </nav>

          <section className="rounded-[2rem] border border-dark-100 bg-white p-3 shadow-[0_24px_90px_rgba(15,23,42,.08)] sm:p-5 lg:p-6">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.03fr)_minmax(380px,.97fr)] xl:gap-12">
              <div className="min-w-0">
                <ProductGallery thumbnail={product.thumbnail} gallery={gallery} productName={product.name} />
              </div>

              <div className="min-w-0 lg:pt-1">
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-dark-200 bg-dark-50 px-3 py-1.5 text-dark-600"><BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Product listing</span>
                  {metadata.variants?.enabled && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700"><Palette className="h-3.5 w-3.5" aria-hidden="true" /> Customizable</span>}
                  {tieredPrices.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700"><Boxes className="h-3.5 w-3.5" aria-hidden="true" /> Wholesale</span>}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {product.categoryName && <Badge variant="secondary">{product.categoryName}</Badge>}
                  {product.isFeatured && <Badge>Featured</Badge>}
                </div>

                <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-dark sm:text-[2.4rem] lg:text-[2.8rem]">{product.name}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-dark-100 pb-4 text-sm">
                  <div className="flex items-center gap-2"><StarRating value={liveRating} size="md" /><span className="font-semibold text-dark">{liveReviewCount ? liveRating.toFixed(1) : "—"}</span></div>
                  <span className="text-dark-400">{liveReviewCount} ulasan</span>
                  {metadata.brand && <span className="text-dark-500">Brand: <strong className="text-dark">{metadata.brand}</strong></span>}
                </div>

                <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/[.045] p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-dark-400">Harga mulai</p>
                  <div className="mt-1 flex flex-wrap items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight text-primary sm:text-[2.75rem]">{formatCurrency(Number(product.basePrice))}</span>
                    <span className="pb-1 text-base text-dark-500">/ {unit}</span>
                    {metadata.pricing?.compareAtPrice && Number(metadata.pricing.compareAtPrice) > Number(product.basePrice) && <span className="pb-1 text-sm text-dark-400 line-through">{formatCurrency(Number(metadata.pricing.compareAtPrice))}</span>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["MOQ", `${product.minOrder || 1} ${unit}`],
                      ["Lead time", `${metadata.shipping?.leadTimeDays || product.productionDays || 3} hari`],
                      ["Order", stockStatus === "in_stock" ? "Ready" : stockStatus === "preorder" ? "Pre-order" : "Custom"],
                      ["SKU", metadata.sku || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white/90 p-3 ring-1 ring-dark-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-dark-400">{label}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-dark">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={stockStatus === "out_of_stock" ? "error" : "success"}>{stockStatus === "out_of_stock" ? "Stok habis" : stockStatus === "preorder" ? "Pre-order" : stockStatus === "made_to_order" ? "Made to order" : "Stok tersedia"}</Badge>
                    {metadata.content?.tags?.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-dark-500 ring-1 ring-dark-100">{tag}</span>)}
                  </div>
                </div>

                {product.shortDescription && <p className="mt-4 text-sm leading-7 text-dark-600 sm:text-base">{product.shortDescription}</p>}
                {metadata.marketing?.promoText && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"><span className="font-bold">{metadata.marketing.badge || "Penawaran"}</span>{metadata.marketing.badge ? " — " : ""}{metadata.marketing.promoText}</div>}

                {(trust.sampleAvailable || trust.customization || trust.responseTime || trade.paymentTerms || trade.inspection || trade.packaging) && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {trust.sampleAvailable && <div className="rounded-2xl border border-dark-100 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-dark-400">Sample</p><p className="mt-1 text-sm font-semibold text-dark">Sample order tersedia</p><p className="mt-1 text-xs leading-5 text-dark-500">Uji material dan finishing sebelum produksi volume.</p></div>}
                    {trust.customization && <div className="rounded-2xl border border-dark-100 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-dark-400">Customization</p><p className="mt-1 text-sm font-semibold text-dark">{trust.customization}</p></div>}
                    {trust.responseTime && <div className="rounded-2xl border border-dark-100 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-dark-400">Response</p><p className="mt-1 text-sm font-semibold text-dark">{trust.responseTime}</p></div>}
                    {trade.paymentTerms && <div className="rounded-2xl border border-dark-100 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-dark-400">Payment</p><p className="mt-1 text-sm font-semibold text-dark">{trade.paymentTerms}</p></div>}
                  </div>
                )}

                {tieredPrices.length > 0 && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-dark-100">
                    <div className="flex items-center justify-between bg-dark-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wider text-dark-600">Harga grosir</p><span className="text-[11px] text-dark-400">Harga per {unit}</span></div>
                    <div className="grid sm:grid-cols-2">
                      {tieredPrices.map((tier, index) => (
                        <div key={`${tier.minQuantity}-${tier.unitPrice}`} className={`flex items-center justify-between px-4 py-3 text-sm ${index > 0 ? "border-t border-dark-100 sm:border-l" : "border-t border-dark-100 sm:border-t-0"}`}>
                          <span className="text-dark-600">{tier.minQuantity}+ {unit}</span>
                          <strong className="text-dark">{formatCurrency(Number(tier.unitPrice))}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-dark-100 p-4"><div className="flex items-start gap-3"><ShoppingBag className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-sm font-semibold text-dark">Order custom & bulk</p><p className="mt-1 text-xs leading-5 text-dark-500">Konfigurasi spesifikasi dan kuantitas sesuai kebutuhan Anda.</p></div></div></div>
                  <div className="rounded-2xl border border-dark-100 p-4"><div className="flex items-start gap-3"><FileCheck2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-sm font-semibold text-dark">File review</p><p className="mt-1 text-xs leading-5 text-dark-500">Upload file tersedia pada opsi produk yang mendukung.</p></div></div></div>
                </div>

                <Separator className="my-6" />
                <div id="configure" className="scroll-mt-24" />
                <ProductConfiguration
                  productId={product.id}
                  productName={product.name}
                  productSlug={product.slug}
                  productThumbnail={product.thumbnail}
                  basePrice={Number(product.basePrice)}
                  unit={unit}
                  minOrder={product.minOrder || 1}
                  options={allOptions}
                  wholesaleTiers={tieredPrices}
                />
                <Button variant="secondary" size="lg" className="mt-3 w-full" asChild>
                  <a href={`https://wa.me/${BRAND.whatsapp}?text=Halo%20Madina%20Solution%2C%20saya%20ingin%20membahas%20${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />Tanya & konsultasi
                  </a>
                </Button>
              </div>
            </div>
          </section>

          <nav aria-label="Navigasi detail produk" className="mt-6 overflow-x-auto rounded-2xl border border-dark-100 bg-white shadow-sm">
            <div className="flex min-w-max gap-1 p-1.5 text-sm font-semibold">
              <a href="#overview" className="rounded-xl px-4 py-2.5 text-dark-600 hover:bg-dark-50 hover:text-dark">Overview</a>
              <a href="#specifications" className="rounded-xl px-4 py-2.5 text-dark-600 hover:bg-dark-50 hover:text-dark">Spesifikasi</a>
              <a href="#customization" className="rounded-xl px-4 py-2.5 text-dark-600 hover:bg-dark-50 hover:text-dark">Customization</a>
              <a href="#shipping" className="rounded-xl px-4 py-2.5 text-dark-600 hover:bg-dark-50 hover:text-dark">Produksi & pengiriman</a>
              <a href="#faq" className="rounded-xl px-4 py-2.5 text-dark-600 hover:bg-dark-50 hover:text-dark">FAQ</a>
              <a href="#reviews" className="rounded-xl px-4 py-2.5 text-dark-600 hover:bg-dark-50 hover:text-dark">Ulasan</a>
            </div>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0">
              <Card id="overview" className="scroll-mt-24 overflow-hidden border-dark-100 shadow-sm">
                <CardContent className="p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Product story</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-dark">Deskripsi produk</h2></div><Badge variant="secondary">{metadata.condition === "new" ? "New" : metadata.condition || "Product"}</Badge></div>
                  <div className="mt-5 rich-product-content prose prose-dark max-w-none" dangerouslySetInnerHTML={{ __html: richDescription || "<p>Deskripsi produk belum tersedia.</p>" }} />

                  {highlights.length ? (
                    <div id="customization" className="mt-8 scroll-mt-24 border-t border-dark-100 pt-8">
                      <h3 className="text-lg font-semibold text-dark">Keunggulan & opsi</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">{highlights.map((item) => <div key={item} className="flex gap-3 rounded-xl border border-dark-100 bg-dark-50/60 p-3 text-sm font-medium text-dark-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{item}</div>)}</div>
                    </div>
                  ) : null}

                  {Object.keys(specs).length > 0 && (
                    <div id="specifications" className="mt-8 scroll-mt-24 border-t border-dark-100 pt-8">
                      <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Technical data</p><h3 className="mt-2 text-lg font-semibold text-dark">Spesifikasi</h3></div><span className="text-xs text-dark-400">Detail produksi</span></div>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-dark-100"><div className="divide-y divide-dark-100">{Object.entries(specs).map(([key, value]) => <div key={key} className="grid gap-2 px-4 py-3 sm:grid-cols-[190px_1fr]"><span className="text-sm text-dark-500 capitalize">{key.replace(/_/g, " ")}</span><span className="text-sm font-medium text-dark">{value}</span></div>)}</div></div>
                    </div>
                  )}

                  <div className="mt-8 grid gap-3 border-t border-dark-100 pt-8 sm:grid-cols-3">
                    <div className="rounded-2xl bg-dark-50 p-4"><Clock3 className="h-5 w-5 text-primary" aria-hidden="true" /><p className="mt-3 text-xs text-dark-500">Lead time</p><p className="mt-1 font-semibold text-dark">{metadata.shipping?.leadTimeDays || product.productionDays || 3} hari kerja</p></div>
                    <div className="rounded-2xl bg-dark-50 p-4"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /><p className="mt-3 text-xs text-dark-500">Kualitas</p><p className="mt-1 font-semibold text-dark">QC sebelum pengiriman</p></div>
                    <div className="rounded-2xl bg-dark-50 p-4"><Package className="h-5 w-5 text-primary" aria-hidden="true" /><p className="mt-3 text-xs text-dark-500">Fulfillment</p><p className="mt-1 font-semibold text-dark">{stockStatus === "in_stock" ? "Ready stock" : "Made to order"}</p></div>
                  </div>
                </CardContent>
              </Card>

              {faq.length > 0 && (
                <Card id="faq" className="mt-6 scroll-mt-24 border-dark-100 shadow-sm"><CardContent className="p-6"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Buyer questions</p><h2 className="mt-2 text-2xl font-semibold text-dark">Pertanyaan yang sering diajukan</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.question} className="group rounded-2xl border border-dark-100 p-4"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-dark marker:hidden">{item.question}</summary><div className="mt-3 text-sm leading-7 text-dark-600">{item.answer}</div></details>)}</div></CardContent></Card>
              )}

              <Card id="reviews" className="mt-6 scroll-mt-24 border-dark-100 shadow-sm"><CardContent className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Buyer feedback</p><h2 className="mt-2 text-2xl font-semibold text-dark">Ulasan pelanggan</h2></div><div className="flex items-center gap-2"><StarRating value={liveRating} size="md" /><span className="font-semibold text-dark">{liveReviewCount ? liveRating.toFixed(1) : "—"}</span><span className="text-sm text-dark-400">({liveReviewCount})</span></div></div>
                {productReviews.length > 0 ? <div className="mt-6 space-y-6">{productReviews.map((review) => <article key={review.id} className="border-b border-dark-100 pb-6 last:border-0"><div className="flex gap-4">{review.userAvatar ? <SiteImage src={review.userAvatar} alt={review.userName || "Pengguna"} width={40} height={40} className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary" aria-hidden="true"><UserCircle className="h-5 w-5" /></div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-dark">{review.userName || "Pengguna"}</span>{review.isVerified && <Badge variant="success"><Check className="mr-1 h-3 w-3" aria-hidden="true" />Terverifikasi</Badge>}</div><div className="mt-1 flex items-center gap-2"><StarRating value={review.rating} /><span className="text-xs text-dark-400">{review.rating}.0</span></div>{review.comment && <p className="mt-2 text-sm leading-7 text-dark-600">{review.comment}</p>}</div></div></article>)}</div> : <p className="mt-6 rounded-2xl bg-dark-50 p-5 text-sm text-dark-500">Belum ada ulasan untuk produk ini.</p>}
                <ReviewForm productId={product.id} isLoggedIn={!!session} existingReview={myReview} />
              </CardContent></Card>
            </div>

            <aside className="space-y-5">
              <Card className="border-dark-100 shadow-sm lg:sticky lg:top-24"><CardContent className="p-5"><div className="flex items-center gap-3 border-b border-dark-100 pb-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-dark text-white"><span className="text-xs font-bold">MS</span></div><div><p className="text-sm font-bold text-dark">Madina Solution</p><p className="text-xs text-dark-500">Creative & Printing Partner</p></div><BadgeCheck className="ml-auto h-5 w-5 text-primary" aria-label="Madina Solution partner" /></div><div className="mt-4 space-y-3 text-sm"><div className="flex gap-3"><MessageSquareQuote className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="text-dark-600">Konsultasi spesifikasi dan kebutuhan custom.</span></div><div className="flex gap-3"><FileCheck2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="text-dark-600">Review file sebelum produksi sesuai opsi pesanan.</span></div><div className="flex gap-3"><Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="text-dark-600">Pengiriman disesuaikan dengan pesanan dan lokasi.</span></div></div><Button className="mt-5 w-full" size="lg" asChild><a href={`https://wa.me/${BRAND.whatsapp}?text=Halo%20Madina%20Solution%2C%20saya%20ingin%20meminta%20penawaran%20untuk%20${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />Minta penawaran</a></Button></CardContent></Card>

              <Card id="shipping" className="scroll-mt-24 border-dark-100 shadow-sm"><CardContent className="p-5"><h3 className="font-semibold text-dark">Produksi & pengiriman</h3><div className="mt-4 space-y-4 text-sm"><div className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-medium text-dark">Pengiriman</p><p className="mt-1 text-dark-500">Tersedia pengiriman ke seluruh Indonesia.</p></div></div><div className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-medium text-dark">Lead time</p><p className="mt-1 text-dark-500">{metadata.shipping?.leadTimeDays || product.productionDays || 3} hari pengerjaan + pengiriman.</p></div></div>{metadata.shipping?.freeShipping && <div className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-medium text-dark">Shipping</p><p className="mt-1 text-dark-500">Free shipping sesuai konfigurasi produk.</p></div></div>}{metadata.shipping?.origin && <div className="flex gap-3"><Package className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-medium text-dark">Lokasi produksi</p><p className="mt-1 text-dark-500">{metadata.shipping.origin}</p></div></div>}{(metadata.shipping?.lengthCm || metadata.shipping?.widthCm || metadata.shipping?.heightCm) && <div className="flex gap-3"><Boxes className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-medium text-dark">Dimensi paket</p><p className="mt-1 text-dark-500">{metadata.shipping.lengthCm || "—"} × {metadata.shipping.widthCm || "—"} × {metadata.shipping.heightCm || "—"} cm</p></div></div>}</div></CardContent></Card>

              {(trust.certifications?.length || trust.protection || trade.inspection || trade.packaging || trade.shippingTerms) ? <Card className="border-dark-100 shadow-sm"><CardContent className="p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /><h3 className="font-semibold text-dark">Trust & procurement</h3></div><div className="mt-4 space-y-3 text-sm">{trust.protection && <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><p className="font-semibold">Perlindungan pesanan</p><p className="mt-1 text-xs leading-5">{trust.protection}</p></div>}{trust.certifications?.length ? <div><p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Sertifikasi / standar</p><div className="mt-2 flex flex-wrap gap-2">{trust.certifications.map((cert) => <span key={cert} className="rounded-full border border-dark-200 px-3 py-1 text-xs font-medium text-dark-600">{cert}</span>)}</div></div> : null}{trade.inspection && <div><p className="font-medium text-dark">Quality inspection</p><p className="mt-1 text-xs leading-5 text-dark-500">{trade.inspection}</p></div>}{trade.packaging && <div><p className="font-medium text-dark">Packaging</p><p className="mt-1 text-xs leading-5 text-dark-500">{trade.packaging}</p></div>}{trade.shippingTerms && <div><p className="font-medium text-dark">Shipping terms</p><p className="mt-1 text-xs leading-5 text-dark-500">{trade.shippingTerms}</p></div>}</div></CardContent></Card> : null}

              <Card className="border-dark-100 shadow-sm"><CardContent className="p-5"><h3 className="font-semibold text-dark">Alur pemesanan</h3><div className="mt-4 space-y-4">{[["01","Pilih spesifikasi"],["02","Tentukan kuantitas"],["03","Upload / kirim desain"],["04","Review & produksi"]].map(([n,title]) => <div key={n} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-dark text-[10px] font-bold text-white">{n}</span><span className="text-sm font-medium text-dark">{title}</span></div>)}</div></CardContent></Card>
            </aside>
          </div>

          <div className="sticky bottom-3 z-30 mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-dark-200 bg-white/95 p-2 shadow-[0_18px_55px_rgba(15,23,42,.14)] backdrop-blur lg:hidden">
            <div className="min-w-0 flex-1 px-2"><p className="truncate text-[10px] font-bold uppercase tracking-[.16em] text-dark-400">Mulai dari</p><p className="truncate text-base font-black text-dark">{formatCurrency(Number(product.basePrice))}<span className="ml-1 text-xs font-medium text-dark-400">/{unit}</span></p></div>
            <Button variant="outline" size="sm" asChild><a href="#configure">Konfigurasi</a></Button>
            <Button size="sm" asChild><a href={`https://wa.me/${BRAND.whatsapp}?text=Halo%20Madina%20Solution%2C%20saya%20ingin%20meminta%20penawaran%20${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />Penawaran</a></Button>
          </div>

          {siteConfig.adsEnabled && siteConfig.adsClient && siteConfig.adsSlots.product ? <div className="mt-10"><AdSenseUnit client={siteConfig.adsClient} slot={siteConfig.adsSlots.product} className="mx-auto max-w-4xl" label="Iklan" /></div> : null}
          {relatedProducts.length > 0 ? <RelatedProducts products={relatedProducts} /> : null}
        </div>
      </main>
    </>
  );
}
