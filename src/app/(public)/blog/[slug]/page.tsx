import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.select({ title: articles.title, excerpt: articles.excerpt }).from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!result[0]) return { title: "Artikel Tidak Ditemukan" };
  return { title: result[0].title, description: result[0].excerpt || `${result[0].title} — Madina Solution` };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await db.select().from(articles).where(and(eq(articles.slug, slug), eq(articles.isPublished, true))).limit(1);
  const article = result[0];
  if (!article) notFound();

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <nav className="mb-8 flex items-center gap-2 text-sm text-dark-500">
          <Link href="/" className="hover:text-primary">Beranda</Link><ChevronRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-primary">Blog</Link><ChevronRight className="h-4 w-4" />
          <span className="text-dark">{article.title}</span>
        </nav>

        {article.category && <Badge variant="secondary" className="mb-4">{article.category}</Badge>}
        <h1 className="text-3xl font-bold text-dark lg:text-4xl">{article.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-dark-500">
          <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}</div>
        </div>

        {article.excerpt && <p className="mt-6 text-lg text-dark-600 leading-relaxed">{article.excerpt}</p>}

        <div className="mt-8 prose prose-dark max-w-none">
          <div className="whitespace-pre-wrap text-dark-700 leading-relaxed">{article.content || "Konten artikel belum tersedia."}</div>
        </div>

        <div className="mt-12 border-t border-dark-100 pt-8">
          <Button variant="outline" asChild><Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Blog</Link></Button>
        </div>
      </div>
    </div>
  );
}
