import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { ChevronRight, ArrowLeft, Building, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.select({ title: portfolio.title, description: portfolio.description }).from(portfolio).where(eq(portfolio.slug, slug)).limit(1);
  if (!result[0]) return { title: "Portfolio Tidak Ditemukan" };
  return { title: result[0].title, description: result[0].description || `${result[0].title} — Portfolio Madina Solution` };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await db.select().from(portfolio).where(and(eq(portfolio.slug, slug), eq(portfolio.isActive, true))).limit(1);
  const item = result[0];
  if (!item) notFound();

  const related = await db.select({ id: portfolio.id, title: portfolio.title, slug: portfolio.slug, category: portfolio.category, client: portfolio.client }).from(portfolio).where(and(ne(portfolio.id, item.id), eq(portfolio.isActive, true))).limit(3);
  const tags = (item.tags as string[]) || [];

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <nav className="mb-8 flex items-center gap-2 text-sm text-dark-500">
          <Link href="/" className="hover:text-primary">Beranda</Link><ChevronRight className="h-4 w-4" />
          <Link href="/portfolio" className="hover:text-primary">Portfolio</Link><ChevronRight className="h-4 w-4" />
          <span className="text-dark">{item.title}</span>
        </nav>

        {item.category && <Badge variant="secondary" className="mb-4">{item.category}</Badge>}
        <h1 className="text-3xl font-bold text-dark lg:text-4xl">{item.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-dark-500">
          {item.client && <div className="flex items-center gap-1"><Building className="h-4 w-4" />{item.client}</div>}
        </div>

        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-dark-100">
          <div className="flex h-full items-center justify-center"><span className="text-6xl font-bold text-dark-300">{item.title.charAt(0)}</span></div>
        </div>

        {item.description && <div className="mt-8 text-lg text-dark-600 leading-relaxed whitespace-pre-wrap">{item.description}</div>}

        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark">Portfolio Lainnya</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">{related.map((r) => (
              <Link key={r.id} href={`/portfolio/${r.slug}`}>
                <Card className="group h-full hover:shadow-premium-lg"><CardContent className="p-5">
                  <h3 className="font-semibold text-dark group-hover:text-primary">{r.title}</h3>
                  <p className="mt-1 text-sm text-dark-500">{r.client || r.category || ""}</p>
                </CardContent></Card>
              </Link>
            ))}</div>
          </div>
        )}

        <div className="mt-12 border-t border-dark-100 pt-8">
          <Button variant="outline" asChild><Link href="/portfolio"><ArrowLeft className="mr-2 h-4 w-4" />Semua Portfolio</Link></Button>
        </div>
      </div>
    </div>
  );
}
