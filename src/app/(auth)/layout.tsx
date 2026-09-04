import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getPublicStats } from "@/lib/site-content";
import { getPublicSiteConfig } from "@/lib/site-config";
import { SiteImage } from "@/components/ui/site-image";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [stats, site] = await Promise.all([getPublicStats(), getPublicSiteConfig()]);
  return (
    <div className="min-h-screen bg-white">
      <div className="absolute left-0 right-0 top-0 z-10 lg:hidden">
        <div className="mx-auto max-w-7xl px-4 py-4"><Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-dark-600 transition-colors hover:text-primary"><ArrowLeft className="h-4 w-4" />Kembali ke Beranda</Link></div>
      </div>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-dark lg:flex">
          <div className="absolute inset-0 opacity-20"><div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white blur-3xl" /><div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" /></div>
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <Link href="/" className="flex items-center gap-3" aria-label="Madina Solution Home">{site.siteLogo ? <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/20 bg-white shadow-sm"><SiteImage src={site.siteLogo} alt={site.siteName} fill sizes="40px" className="object-contain p-1" /></div> : <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><span className="text-lg font-black">{site.siteName.charAt(0).toUpperCase()}</span></div>}<div><h1 className="text-base font-bold tracking-tight text-white">{site.siteName}</h1><p className="text-xs text-white/70">{site.siteTagline}</p></div></Link>
            <div className="max-w-md">
              <h2 className="text-balance text-4xl font-bold leading-tight">Bangun visual yang membuat bisnis terlihat lebih bernilai.</h2>
              <p className="mt-4 text-pretty text-lg text-white/80">Dari desain hingga produksi, Madina Solution membantu bisnis menghadirkan identitas visual yang kuat, konsisten, dan siap tampil di dunia nyata.</p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div><p className="text-2xl font-bold">{stats.products}+</p><p className="mt-1 text-sm text-white/70">Produk</p></div>
                <div><p className="text-2xl font-bold">{stats.services}+</p><p className="mt-1 text-sm text-white/70">Layanan</p></div>
                <div><p className="text-2xl font-bold">{stats.testimonials}+</p><p className="mt-1 text-sm text-white/70">Testimoni</p></div>
              </div>
            </div>
            <div className="text-sm text-white/60">&copy; {new Date().getFullYear()} {site.siteName}. All rights reserved.</div>
          </div>
        </div>
        <div className="flex items-center justify-center px-4 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-6 hidden items-center gap-2 text-sm font-medium text-dark-500 transition-colors hover:text-primary lg:inline-flex"><ArrowLeft className="h-4 w-4" />Kembali ke Beranda</Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
