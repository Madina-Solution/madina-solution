import { SiteImage } from "@/components/ui/site-image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, and, ne, sql, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowLeft, Calendar, Clock, Eye, Tag as TagIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSenseUnit } from "@/components/ads/adsense";
import { getPublicSiteConfig } from "@/lib/site-config";
import { buildPageMetadata } from "@/lib/seo";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/json-ld";
import { RelatedArticles } from "./related-articles";

type Props = { params: Promise<{ slug: string }> };

const WORDS_PER_MINUTE = 200;

function estimateReadingMinutes(content: string | null): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.select({ title: articles.title, excerpt: articles.excerpt, thumbnail: articles.thumbnail }).from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!result[0]) return { title: "Artikel Tidak Ditemukan" };
  return buildPageMetadata({ title: result[0].title, description: result[0].excerpt || `${result[0].title} — Madina Solution`, path: `/blog/${encodeURIComponent(slug)}`, image: result[0].thumbnail || undefined });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      thumbnail: articles.thumbnail,
      category: articles.category,
      tags: articles.tags,
      viewCount: articles.viewCount,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
    .limit(1);
  if (!article) notFound();

  const siteConfig = await getPublicSiteConfig();
  const pageUrl = `${siteConfig.siteUrl}/blog/${encodeURIComponent(slug)}`;
  const tags = (article.tags as string[] | null) || [];
  const readingMinutes = estimateReadingMinutes(article.content);
  const paragraphs = (article.content || "Konten artikel belum tersedia.").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const related = await db
    .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, thumbnail: articles.thumbnail, category: articles.category, publishedAt: articles.publishedAt })
    .from(articles)
    .where(and(ne(articles.id, article.id), eq(articles.isPublished, true), article.category ? eq(articles.category, article.category) : undefined))
    .orderBy(desc(articles.publishedAt))
    .limit(3);

  // Best-effort view counter — fire-and-forget so it never blocks or slows down the page render.
  void db.update(articles).set({ viewCount: sql`${articles.viewCount} + 1` }).where(eq(articles.id, article.id)).catch(() => {});

  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Beranda", url: siteConfig.siteUrl },
        { name: "Blog", url: `${siteConfig.siteUrl}/blog` },
        { name: article.title, url: pageUrl },
      ]} />
      <ArticleSchema name={article.title} description={article.excerpt || `Artikel ${article.title}`} url={pageUrl} image={article.thumbnail || undefined} publishedAt={article.publishedAt?.toISOString()} updatedAt={undefined} authorName={article.authorName || siteConfig.siteName} />

      <div className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <nav className="mb-8 flex items-center gap-2 text-sm text-dark-500">
            <Link href="/" className="hover:text-primary">Beranda</Link><ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-primary">Blog</Link><ChevronRight className="h-4 w-4" />
            <span className="truncate text-dark">{article.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Main column */}
            <article className="min-w-0">
              {article.category && <Badge variant="secondary" className="mb-4">{article.category}</Badge>}
              <h1 className="text-3xl font-bold leading-tight text-dark lg:text-4xl">{article.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dark-500">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {article.authorAvatar ? <SiteImage src={article.authorAvatar} alt={article.authorName || siteConfig.siteName} fill sizes="24px" className="object-cover" /> : <User className="h-3.5 w-3.5" />}
                  </span>
                  {article.authorName || siteConfig.siteName}
                </div>
                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(article.publishedAt || article.createdAt)}</div>
                <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{readingMinutes} menit baca</div>
                <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{(article.viewCount ?? 0) + 1} views</div>
              </div>

              {article.thumbnail && (
                <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <SiteImage src={article.thumbnail} alt={article.title} fill priority sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" />
                </div>
              )}

              {article.excerpt && <p className="mt-6 text-lg leading-relaxed text-dark-600">{article.excerpt}</p>}

              {siteConfig.adsEnabled && siteConfig.adsClient && siteConfig.adsSlots.article ? (
                <div className="my-8"><AdSenseUnit client={siteConfig.adsClient} slot={siteConfig.adsSlots.article} className="mx-auto" label="Iklan" /></div>
              ) : null}

              <div className="mt-8 space-y-5 text-base leading-8 text-dark-700">
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-dark-100 pt-6">
                  <TagIcon className="h-4 w-4 text-dark-400" />
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-dark-100 pt-8">
                <Button variant="outline" asChild><Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Blog</Link></Button>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-dark-100 bg-dark-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-dark-400">Penulis</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {article.authorAvatar ? <SiteImage src={article.authorAvatar} alt={article.authorName || siteConfig.siteName} fill sizes="44px" className="object-cover" /> : <User className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-dark">{article.authorName || siteConfig.siteName}</p>
                    <p className="text-xs text-dark-400">Tim {siteConfig.siteName}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dark-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-dark-400">Butuh jasa desain atau cetak?</p>
                <p className="mt-2 text-sm text-dark-600">Konsultasikan kebutuhan bisnis Anda dengan tim kami.</p>
                <Button className="mt-4 w-full" asChild><Link href="/contact">Hubungi Kami</Link></Button>
              </div>
            </aside>
          </div>

          <RelatedArticles articles={related} />
        </div>
      </div>
    </>
  );
}
