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
    <section className="section-shell relative overflow-hidden bg-[#FCFBF8]">
      <div className="absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 left-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[#1A1A1A]/[0.035] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 pb-18 pt-10 sm:pt-14 lg:px-6 lg:pb-24 lg:pt-16">
        <div className="surface-premium rounded-[2rem] p-5 sm:p-8 lg:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
            <div className="max-w-2xl">
              <span className="eyebrow">{content.heroBadge}</span>
              <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.03] tracking-[-0.045em] text-dark-900 sm:text-5xl lg:text-[4.35rem]">
                {content.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-dark-600 sm:text-lg">
                {content.heroDescription}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" asChild>
                  <Link href="/products">Mulai Pesanan<ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link href="/portfolio"><Play className="h-4 w-4" />Lihat Portfolio</Link>
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm text-dark-600">
                {['Desain & Cetak', 'Produksi Terintegrasi', 'Konsultasi Langsung'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{item}</span>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statItems.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-black/[0.06] bg-white/75 px-3 py-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <stat.icon className="h-4 w-4 text-primary" />
                      <span className="text-xl font-extrabold tracking-tight text-dark-900">{stat.value}</span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-dark-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative lg:pl-3">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-black/5 blur-xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] bg-dark p-1 shadow-[0_28px_80px_rgba(26,26,26,.20)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.45rem] bg-dark-800">
                  {content.heroImage.includes("/video/upload/") || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(content.heroImage) ? (
                    <video src={content.heroImage} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" aria-label={content.heroImageAlt} />
                  ) : (
                    <SiteImage src={content.heroImage} alt={content.heroImageAlt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-black/55 p-4 text-white backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{content.siteName}</p>
                        <p className="mt-1 text-base font-semibold sm:text-lg">{content.siteTagline}</p>
                      </div>
                      <div className="hidden rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 sm:block">Studio • Production • Digital</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
