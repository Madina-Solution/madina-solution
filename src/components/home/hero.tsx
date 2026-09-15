import { SiteImage } from "@/components/ui/site-image";
import { ArrowRight, Play, Sparkles, Package, Layers3, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getHomepageContent, getPublicStats } from "@/lib/site-content";

export async function Hero() {
  const [content, stats] = await Promise.all([getHomepageContent(), getPublicStats()]);
  const statItems = [
    { icon: Package, value: `${stats.products}+`, label: "Produk Aktif" },
    { icon: Layers3, value: `${stats.services}+`, label: "Layanan" },
    { icon: Sparkles, value: `${stats.testimonials}+`, label: "Testimoni" },
    { icon: MessageCircle, value: `< ${content.responseHours} Jam`, label: "Respons Konsultasi" },
  ];

  return (
    <section className="premium-shell relative isolate overflow-hidden">
      <div className="premium-grid pointer-events-none absolute inset-x-0 top-0 h-[62%] opacity-70" />
      <div className="pointer-events-none absolute -left-28 top-12 h-80 w-80 rounded-full bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-96 w-96 rounded-full bg-amber-100/60 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 lg:px-6 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_.96fr] lg:gap-16">
          <div className="max-w-2xl">
            <span className="section-kicker">{content.heroBadge}</span>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] text-dark sm:text-6xl lg:text-[4.6rem]">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-dark-600 lg:text-xl">
              {content.heroDescription}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-2xl px-7 shadow-glow" asChild>
                <Link href="/products">Mulai Pesanan<ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl border-dark-200 bg-white/70 px-7" asChild>
                <Link href="/portfolio"><Play className="mr-1 h-4 w-4" />Lihat Portfolio</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-dark-500">
              {["Konsultasi manusia", "Workflow transparan", "Kualitas terukur"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-3 w-3" /></span>{item}</span>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statItems.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-2xl font-bold tracking-tight text-dark">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-dark-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:pl-4">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/5 blur-2xl" />
            <div className="relative aspect-[4/4.25] overflow-hidden rounded-[2.25rem] border border-white/90 bg-dark-900 p-2 shadow-premium-lg lg:aspect-[4/4.55]">
              <div className="relative h-full overflow-hidden rounded-[1.85rem]">
                {content.heroImage.includes("/video/upload/") || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(content.heroImage) ? <video src={content.heroImage} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" aria-label={content.heroImageAlt} /> : <SiteImage
                  src={content.heroImage}
                  alt={content.heroImageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="h-full w-full object-cover"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-md">MADINA SOLUTION</div>
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-black/45 p-5 text-white backdrop-blur-xl">
                  <p className="text-xs font-medium uppercase tracking-[.16em] text-white/60">Creative Business Platform</p>
                  <p className="mt-1.5 text-xl font-semibold leading-tight">{content.siteTagline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
