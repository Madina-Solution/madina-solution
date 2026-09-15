import { SiteImage } from "@/components/ui/site-image";
import { ArrowRight, Play, Sparkles, Package, Layers3, MessageCircle, CheckCircle2 } from "lucide-react";
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
    <section className="relative overflow-hidden border-b border-dark-100 bg-[radial-gradient(circle_at_15%_20%,rgba(240,90,22,.12),transparent_32%),radial-gradient(circle_at_85%_35%,rgba(240,90,22,.08),transparent_28%),linear-gradient(180deg,#fffaf6_0%,#fff_72%)]">
      <div className="absolute inset-0 luxury-grid opacity-40" aria-hidden="true" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24 xl:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_.97fr] lg:gap-16">
          <div>
            <span className="section-kicker">{content.heroBadge}</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] text-dark-900 sm:text-5xl lg:text-[4.15rem]">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-dark-600 lg:text-lg">{content.heroDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="rounded-full px-8 shadow-[0_14px_30px_rgba(240,90,22,.22)]" asChild>
                <Link href="/products">Mulai Pesanan<ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-dark-200 bg-white/80 px-8" asChild>
                <Link href="/portfolio"><Play className="mr-1 h-5 w-5" />Lihat Portfolio</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-dark-500">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Konsultasi sebelum pesan</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Workflow terpantau</span>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {statItems.map((stat) => (
                <div key={stat.label} className="premium-panel rounded-2xl p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-dark-900">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-dark-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-5 top-10 h-20 w-20 rounded-2xl border border-primary/20 bg-white/80 shadow-premium backdrop-blur" aria-hidden="true" />
            <div className="absolute -right-5 bottom-14 h-28 w-28 rounded-full border border-primary/20 bg-primary/5" aria-hidden="true" />
            <div className="premium-panel relative overflow-hidden rounded-[2rem] p-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.55rem] bg-dark-100">
                {content.heroImage.includes("/video/upload/") || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(content.heroImage) ? <video src={content.heroImage} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" aria-label={content.heroImageAlt} /> : <SiteImage src={content.heroImage} alt={content.heroImageAlt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <div className="inline-flex rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.18em] text-white/80 backdrop-blur-md">Madina Solution</div>
                  <p className="mt-2 max-w-md text-xl font-bold tracking-tight text-white sm:text-2xl">{content.siteTagline}</p>
                </div>
              </div>
            </div>
            <div className="premium-panel absolute -bottom-5 -left-5 hidden rounded-2xl px-4 py-3 sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Creative Business Platform</p>
              <p className="mt-1 text-sm font-semibold text-dark-900">Desain • Cetak • Digital</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
