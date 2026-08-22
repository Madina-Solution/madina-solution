import Link from "next/link";
import { ArrowRight, Palette, Printer, Megaphone, Sparkles, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SERVICE_NAV_GROUPS } from "@/lib/navigation";

const ICONS = {
  design: Palette,
  printing: Printer,
  advertising: Megaphone,
  branding: Sparkles,
  business: Package,
} as const;

export function Services() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Layanan Kami</span>
          <h2 className="mt-3 text-3xl font-bold text-dark sm:text-4xl lg:text-5xl">Solusi Lengkap untuk <span className="text-gradient">Kebutuhan Bisnis</span></h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-600">Dari ide hingga produksi, kami siap membantu mewujudkan kebutuhan visual dan promosi bisnis Anda.</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_NAV_GROUPS.map((group) => {
            const Icon = ICONS[group.icon];
            const href = group.items[0]?.href || "/services";
            return (
              <Link key={group.slug} href={href}>
                <Card className="group h-full cursor-pointer border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${group.color} text-white transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-dark group-hover:text-primary">{group.category}</h3>
                    <p className="mt-2 text-dark-500">{group.description}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary">Selengkapnya<ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/services">Lihat Semua Layanan<ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
