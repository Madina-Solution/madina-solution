import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye, Tag as TagIcon, User, ShieldCheck, Sparkles } from "lucide-react";
import { db } from "@/db";
import { ensureRuntimeSchema } from "@/db/ensure-runtime-schema";
import { articles, users } from "@/db/schema";
import { eq, and, ne, sql, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdSenseUnit } from "@/components/ads/adsense";
import { getPublicSiteConfig } from "@/lib/site-config";
import { buildPageMetadata } from "@/lib/seo";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/json-ld";
import { RelatedArticles } from "./related-articles";
import { ArticleContent } from "@/components/blog/article-content";
import { ArticleReadingTools } from "@/components/blog/article-reading-tools";
import { ArticleToc } from "@/components/blog/article-toc";
import { InlineNewsletter } from "@/components/blog/inline-newsletter";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import type { ArticleAdminMetadata } from "@/db/schema";

type Props = { params: Promise<{ slug: string }> };
const WORDS_PER_MINUTE = 200;

function estimateReadingMinutes(content: string | null): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function buildHeadings(content: string) {
  const regex = /<h([2-3])[^>]*>([\s\S]*?)<\/h[2-3]>/gi;
  const raw: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while (raw.length < 12 && (match = regex.exec(content)) !== null) raw.push(match);
  const headings = raw.map((m, i) => ({ id: `section-${i + 1}`, level: Number(m[1]), title: m[2].replace(/<[^>]+>/g, "").trim() }));
  let indexed = content;
  raw.forEach((m, i) => { indexed = indexed.replace(m[0], m[0].replace(/^<h([2-3])/, `<h$1 id="${headings[i].id}"`)); });
  return { headings, indexed };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureRuntimeSchema();
  const { slug } = await params;
  const result = await db.select({ title: articles.title, excerpt: articles.excerpt, thumbnail: articles.thumbnail, metadata: articles.metadata }).from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!result[0]) return { title: "Artikel Tidak Ditemukan" };
  const metadata = (result[0].metadata as ArticleAdminMetadata | null) || {};
  return buildPageMetadata({
    title: metadata.seo?.title || result[0].title,
    description: metadata.seo?.description || result[0].excerpt || `${result[0].title} — Madina Solution`,
    path: `/blog/${encodeURIComponent(slug)}`,
    canonicalUrl: metadata.seo?.canonicalUrl,
    image: metadata.seo?.ogImage || result[0].thumbnail || undefined,
    noIndex: !!metadata.seo?.noIndex,
    keywords: metadata.seo?.keywords || [],
    openGraphTitle: metadata.seo?.ogTitle,
    openGraphDescription: metadata.seo?.ogDescription,
    twitterTitle: metadata.seo?.twitterTitle,
    twitterDescription: metadata.seo?.twitterDescription,
  });
}

export default async function BlogDetailPage({ params }: Props) {
  await ensureRuntimeSchema();
  const { slug } = await params;
  const [article] = await db.select({
    id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, content: articles.content,
    thumbnail: articles.thumbnail, category: articles.category, tags: articles.tags, viewCount: articles.viewCount,
    publishedAt: articles.publishedAt, createdAt: articles.createdAt, updatedAt: articles.updatedAt, metadata: articles.metadata,
    authorName: users.name, authorAvatar: users.avatar,
  }).from(articles).leftJoin(users, eq(articles.authorId, users.id)).where(and(eq(articles.slug, slug), eq(articles.isPublished, true))).limit(1);
  if (!article) notFound();

  const siteConfig = await getPublicSiteConfig();
  const metadata = (article.metadata as ArticleAdminMetadata | null) || {};
  const pageUrl = `${siteConfig.siteUrl}/blog/${encodeURIComponent(slug)}`;
  const tags = (article.tags as string[] | null) || [];
  const readingMinutes = metadata.editorial?.readingTime || estimateReadingMinutes(article.content);
  const safeContent = sanitizeRichHtml(article.content || "<p>Konten artikel belum tersedia.</p>");
  const { headings, indexed } = buildHeadings(safeContent);
  const related = await db.select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, thumbnail: articles.thumbnail, category: articles.category, publishedAt: articles.publishedAt }).from(articles).where(and(ne(articles.id, article.id), eq(articles.isPublished, true), article.category ? eq(articles.category, article.category) : undefined)).orderBy(desc(articles.publishedAt)).limit(6);
  void db.update(articles).set({ viewCount: sql`${articles.viewCount} + 1` }).where(eq(articles.id, article.id)).catch(() => {});

  const editorialName = metadata.editorial?.authorName || article.authorName || siteConfig.siteName;
  const authorRole = metadata.editorial?.authorRole || "Editorial team";
  const authorBio = metadata.editorial?.authorBio || `Penulis dan tim editorial ${siteConfig.siteName}, membahas desain, branding, digital printing, dan strategi visual untuk bisnis.`;
  const updatedDate = article.updatedAt && article.publishedAt && article.updatedAt.getTime() > article.publishedAt.getTime() ? article.updatedAt : article.publishedAt;
  const inlineRelated = related.slice(0, 2);
  const midIndex = Math.min(Math.max(1, Math.floor(indexed.split("</p>").length / 2)), indexed.length);
  const midpoint = indexed.indexOf("</p>", midIndex);
  const contentBeforeCta = midpoint > 0 ? indexed.slice(0, midpoint + 4) : indexed;
  const contentAfterCta = midpoint > 0 ? indexed.slice(midpoint + 4) : "";

  return (
    <>
      <BreadcrumbSchema items={[{ name: "Beranda", url: siteConfig.siteUrl }, { name: "Blog", url: `${siteConfig.siteUrl}/blog` }, { name: article.title, url: pageUrl }]} />
      <ArticleSchema name={article.title} description={article.excerpt || `Artikel ${article.title}`} url={pageUrl} image={article.thumbnail || undefined} publishedAt={article.publishedAt?.toISOString()} updatedAt={updatedDate?.toISOString()} authorName={editorialName} />
      <ArticleReadingTools url={pageUrl} title={article.title} />

      <div className="bg-[#fcfbf9] py-10 lg:py-16">
        <div className="mx-auto max-w-[1320px] px-4 lg:px-6">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-dark-500"><Link href="/" className="hover:text-primary">Beranda</Link><span aria-hidden="true">/</span><Link href="/blog" className="hover:text-primary">Blog</Link><span aria-hidden="true">/</span><span className="truncate text-dark">{article.title}</span></nav>

          <header className="mx-auto max-w-4xl text-center">
            {article.category && <Badge variant="secondary">{article.category}</Badge>}
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-dark sm:text-4xl lg:text-5xl lg:leading-[1.08]">{article.title}</h1>
            {article.excerpt && <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-dark-600 lg:text-lg">{article.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-dark-500">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" />Terbit {formatDate(article.publishedAt || article.createdAt)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{readingMinutes} menit baca</span>
              <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" aria-hidden="true" />{(article.viewCount ?? 0) + 1} views</span>
            </div>
            {updatedDate && <p className="mt-3 text-xs font-medium text-dark-400">Terakhir diperbarui {formatDate(updatedDate)}</p>}
          </header>

          {article.thumbnail && <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border border-dark-100 bg-white p-2 shadow-[0_25px_70px_rgba(15,23,42,.1)]"><img src={article.thumbnail} alt={article.title} width="1600" height="900" className="aspect-[16/9] w-full rounded-[1.5rem] object-cover" /></div>}

          <div className="mx-auto mt-10 grid max-w-[1240px] gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start xl:gap-10">
            <main className="min-w-0">
              <div className="mb-6 lg:hidden"><ArticleToc headings={headings} /></div>
              {siteConfig.adsEnabled && siteConfig.adsClient && siteConfig.adsSlots.article ? <div className="mb-8"><AdSenseUnit client={siteConfig.adsClient} slot={siteConfig.adsSlots.article} className="mx-auto" label="Iklan" /></div> : null}

              <article className="overflow-hidden rounded-[2rem] border border-dark-100 bg-white px-5 py-7 shadow-[0_12px_50px_rgba(15,23,42,.06)] sm:px-8 lg:px-10 lg:py-10">
                <div className="mb-8 rounded-2xl border border-dark-100 bg-dark-50/70 p-5"><div className="flex items-center gap-2 text-sm font-bold text-dark"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />Insight editorial</div><p className="mt-2 text-sm leading-6 text-dark-600">Artikel ini ditulis untuk membantu pembaca memahami topik secara praktis, dengan pembaruan konten ketika informasi relevan berubah.</p></div>
                <ArticleContent html={contentBeforeCta} />
                {metadata.distribution?.newsletter && <InlineNewsletter />}
                {inlineRelated.length > 0 && <Card className="my-10 border-primary/15 bg-primary/[.035]"><CardContent className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Baca berikutnya</p><div className="mt-3 grid gap-4 sm:grid-cols-2">{inlineRelated.map((item) => <Link key={item.id} href={`/blog/${item.slug}`} className="group rounded-2xl border border-dark-100 bg-white p-4"><p className="text-sm font-bold leading-5 text-dark group-hover:text-primary">{item.title}</p>{item.excerpt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-dark-500">{item.excerpt}</p>}<span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">Baca artikel <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" /></span></Link>)}</div></CardContent></Card>}
                {contentAfterCta && <ArticleContent html={contentAfterCta} />}

                {metadata.distribution?.ctaTitle && <aside className="my-10 rounded-3xl bg-dark p-6 text-white sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Continue the journey</p><h2 className="mt-2 text-xl font-bold">{metadata.distribution.ctaTitle}</h2>{metadata.distribution.ctaText && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{metadata.distribution.ctaText}</p>}{metadata.distribution.ctaHref && <Button className="mt-5" asChild><Link href={metadata.distribution.ctaHref}>{metadata.distribution.ctaLabel || "Mulai sekarang"}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>}</aside>}

                {tags.length > 0 && <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-dark-100 pt-6"><TagIcon className="h-4 w-4 text-dark-400" aria-hidden="true" />{tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>}
              </article>

              <section className="mt-8 rounded-3xl border border-dark-100 bg-white p-6 shadow-sm"><div className="flex gap-4"><span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">{article.authorAvatar ? <img src={article.authorAvatar} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6" aria-hidden="true" />}</span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Tentang penulis</p><h2 className="mt-1 text-lg font-bold text-dark">{editorialName}</h2><p className="text-sm font-medium text-dark-500">{authorRole}</p><p className="mt-2 text-sm leading-6 text-dark-600">{authorBio}</p>{metadata.editorial?.authorCredentials && <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{metadata.editorial.authorCredentials}</div>}</div></div></section>

              <div className="mt-8 flex flex-wrap gap-3"><Button variant="outline" asChild><Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Blog</Link></Button><Button variant="secondary" asChild><Link href="/contact">Konsultasi dengan tim <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
            </main>

            <aside className="min-w-0 lg:sticky lg:top-24">
              <ArticleToc headings={headings} />
              <div className="mt-5 rounded-3xl border border-dark-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-dark-400">Tentang artikel</p>
                <div className="mt-3 space-y-2 text-sm text-dark-600">
                  <div className="flex justify-between gap-4"><span>Penulis</span><strong className="text-right text-dark">{editorialName}</strong></div>
                  <div className="flex justify-between gap-4"><span>Diperbarui</span><strong className="text-right text-dark">{formatDate(updatedDate || article.createdAt)}</strong></div>
                  <div className="flex justify-between gap-4"><span>Subtopik</span><strong className="text-dark">{headings.length}</strong></div>
                </div>
              </div>
            </aside>
          </div>

          <RelatedArticles articles={related.slice(0, 3)} />
        </div>
      </div>
    </>
  );
}
