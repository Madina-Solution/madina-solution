import { SiteImage } from "@/components/ui/site-image";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { services } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function Services() {
  const items = await db.select().from(services).where(eq(services.isActive, true)).orderBy(desc(services.isFeatured), desc(services.createdAt)).limit(6);
  if (!items.length) return null;
  return (
    <section className="section-shell py-20 lg:py-28">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">Layanan Kami</span>
            <h2 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-dark-900 sm:text-4xl lg:text-5xl">Solusi yang terlihat <span className="text-gradient">premium</span> sejak pertama dilihat.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-dark-600">Desain, produksi, dan kebutuhan digital dalam satu partner kerja yang rapi dan terukur.</p>
          </div>
          <Button variant="outline" asChild><Link href="/services">Semua Layanan<ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link key={item.id} href={`/services/${item.slug}`}>
              <Card className="h-full overflow-hidden bg-white/85">
                {item.thumbnail ? <div className="relative aspect-[16/10] w-full overflow-hidden bg-dark-100"><SiteImage src={item.thumbnail} alt={item.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" /></div> : null}
                <div className="p-6 lg:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary ring-1 ring-primary/10"><BriefcaseBusiness className="h-5 w-5" /></div>
                    <span className="text-xs font-bold text-dark-300">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-dark-900 group-hover:text-primary">{item.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-dark-500">{item.shortDescription || item.description}</p>
                  <div className="mt-5 flex items-center text-sm font-semibold text-primary">Eksplor layanan<ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
