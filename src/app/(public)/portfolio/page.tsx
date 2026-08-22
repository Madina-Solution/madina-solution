import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Lihat hasil karya dan proyek-proyek yang telah kami kerjakan untuk berbagai klien.",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const items = await db.select().from(portfolio).where(eq(portfolio.isActive, true)).orderBy(desc(portfolio.createdAt));

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Portfolio</span>
          <h1 className="mt-3 text-4xl font-bold text-dark lg:text-5xl">Hasil Karya Kami</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-600">Lihat berbagai proyek yang telah kami kerjakan untuk klien dari berbagai industri.</p>
        </div>

        {items.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const tags = (item.tags as string[]) || [];
              return (
                <Link key={item.id} href={`/portfolio/${item.slug}`}>
                  <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-premium-lg">
                    <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-bold text-dark-300">{item.title.charAt(0)}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-dark/0 opacity-0 transition-all group-hover:bg-dark/60 group-hover:opacity-100">
                        <Button variant="secondary">Lihat Detail</Button>
                      </div>
                    </div>
                    <div className="p-4">
                      {item.category && <Badge variant="secondary" className="mb-2">{item.category}</Badge>}
                      <h3 className="font-semibold text-dark group-hover:text-primary">{item.title}</h3>
                      {item.client && <p className="mt-1 text-sm text-dark-500">Klien: {item.client}</p>}
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tags.map((tag) => <span key={tag} className="rounded-full bg-dark-50 px-2 py-0.5 text-xs text-dark-500">{tag}</span>)}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <ImageIcon className="h-12 w-12 text-dark-300" />
            <h2 className="mt-4 text-xl font-semibold text-dark">Belum Ada Portfolio</h2>
            <p className="mt-2 text-dark-500">Portfolio proyek akan segera ditampilkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
