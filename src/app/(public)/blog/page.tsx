import { SiteImage } from "@/components/ui/site-image";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Metadata } from "next";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({ title: "Blog", description: "Tips desain, branding, digital printing, marketing visual, dan insight bisnis dari Madina Solution.", path: "/blog" });

// ISR: page is cached and regenerated in the background at most every 60s,
// instead of re-running the full render + DB queries on every single visit.
// Admin changes (new product, price update, etc.) appear within this window.
export const revalidate = 60;

export default async function BlogPage() {
  const articleList = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt));

  return (
    <div>
      <PageHeader
        title="Blog & Artikel"
        description="Tips, inspirasi, dan panduan seputar desain, branding, dan printing."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Blog" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        {articleList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articleList.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <Card className="group h-full transition-all hover:shadow-premium-lg">
                  <div className="aspect-[16/9] overflow-hidden rounded-t-2xl bg-dark-100">
                    {article.thumbnail ? <div className="relative h-full w-full"><SiteImage src={article.thumbnail} alt={article.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" /></div> : <MediaPlaceholder />}
                  </div>
                  <CardContent className="p-5">
                    {article.category && <Badge variant="secondary" className="mb-2">{article.category}</Badge>}
                    <h2 className="font-semibold text-dark group-hover:text-primary">{article.title}</h2>
                    {article.excerpt && <p className="mt-2 text-sm text-dark-500 line-clamp-2">{article.excerpt}</p>}
                    <p className="mt-3 text-xs text-dark-400">{article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-12 w-12 text-dark-300" />
            <h2 className="mt-4 text-xl font-semibold text-dark">Belum Ada Artikel</h2>
            <p className="mt-2 text-dark-500">Artikel dan tips seputar desain & printing akan segera hadir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
