"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, ChevronRight, Compass, ExternalLink, MessageCircleQuestion, Package, Sparkles } from "lucide-react";
import { QUICK_NAV_SERVICES, QUICK_NAV_PRODUCTS, QUICK_NAV_EXPLORE, type QuickNavItem } from "@/lib/navigation";
import { NAV_ICON_MAP } from "@/lib/nav-icons";

type MegaMenuProps = { navigation?: { services: QuickNavItem[]; products: QuickNavItem[]; explore: QuickNavItem[] } };

function ItemIcon({ item }: { item: QuickNavItem }) {
  const Icon = NAV_ICON_MAP[item.icon];
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark-50 text-dark-600 transition-colors group-hover:bg-primary group-hover:text-white"><Icon className="h-4 w-4" /></span>;
}

export function MegaMenu({ navigation = { services: QUICK_NAV_SERVICES, products: QUICK_NAV_PRODUCTS, explore: QUICK_NAV_EXPLORE } }: MegaMenuProps) {
  return (
    <div className="absolute left-1/2 top-full z-50 w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2 pt-3">
      <div className="overflow-hidden rounded-[28px] border border-dark-200 bg-white shadow-[0_24px_70px_-24px_rgba(15,23,42,.28)] ring-1 ring-black/5">
        <div className="grid min-h-[340px] grid-cols-[1.1fr_1.35fr_1fr]">
          <section className="border-r border-dark-100 bg-gradient-to-br from-white via-white to-primary-50/70 p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white shadow-sm"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Layanan</p><h3 className="mt-0.5 text-lg font-black text-dark-900">Bangun brand yang kuat</h3></div></div>
            <p className="mt-4 max-w-sm text-xs leading-5 text-dark-500">Mulai dari identitas visual sampai materi promosi. Pilih layanan sesuai tahap bisnis Anda.</p>
            <div className="mt-5 grid gap-1.5">
              {navigation.services.slice(0, 6).map((item) => <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl p-2.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25"><ItemIcon item={item} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-dark-800 group-hover:text-primary">{item.name}</span>{item.description && <span className="block truncate text-[11px] text-dark-400">{item.description}</span>}</span><ChevronRight className="h-4 w-4 text-dark-300 group-hover:text-primary" /></Link>)}
            </div>
            <Link href="/services" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Semua layanan <ArrowRight className="h-4 w-4" /></Link>
          </section>

          <section className="border-r border-dark-100 p-6">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-dark text-white"><Package className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Produk</p><h3 className="mt-0.5 text-lg font-black text-dark-900">Katalog untuk kebutuhan nyata</h3></div></div><Link href="/products" className="hidden text-xs font-bold text-dark-500 hover:text-primary xl:inline-flex">Katalog penuh <ExternalLink className="ml-1 h-3.5 w-3.5" /></Link></div>
            <p className="mt-4 text-xs leading-5 text-dark-500">Cari berdasarkan jenis produk. Setiap produk terhubung ke detail, kalkulator, spesifikasi, dan pemesanan.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {navigation.products.slice(0, 10).map((item) => <Link key={item.href} href={item.href} className="group flex items-center gap-2 rounded-xl border border-dark-100 bg-white p-2.5 hover:border-primary-200 hover:bg-primary-50/60 focus:outline-none focus:ring-2 focus:ring-primary/25"><ItemIcon item={item} /><span className="truncate text-xs font-bold text-dark-700 group-hover:text-primary">{item.name}</span></Link>)}
            </div>
            <div className="mt-5 rounded-2xl bg-dark-900 p-4 text-white"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-xs font-bold">Butuh produk custom?</span></div><p className="mt-1 text-[11px] leading-5 text-white/60">Kirim brief dan tim kami bantu menentukan bahan, ukuran, finishing, serta estimasi.</p><Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white hover:text-primary">Konsultasi <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          </section>

          <section className="bg-dark-50/70 p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Compass className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Eksplor</p><h3 className="mt-0.5 text-lg font-black text-dark-900">Insight & informasi</h3></div></div>
            <div className="mt-5 space-y-2">
              {navigation.explore.map((item) => <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-dark-100 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/25"><ItemIcon item={item} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-dark-800 group-hover:text-primary">{item.name}</span>{item.description && <span className="mt-0.5 block text-[11px] text-dark-400">{item.description}</span>}</span></Link>)}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2"><Link href="/blog" className="rounded-xl border border-dark-100 bg-white p-3 hover:border-primary-200"><BookOpen className="h-4 w-4 text-primary" /><span className="mt-2 block text-xs font-bold text-dark-800">Insight</span><span className="mt-0.5 block text-[10px] text-dark-400">Artikel & tips praktis</span></Link><Link href="/contact" className="rounded-xl bg-primary p-3 text-white hover:bg-primary-dark"><MessageCircleQuestion className="h-4 w-4" /><span className="mt-2 block text-xs font-bold">Konsultasi</span><span className="mt-0.5 block text-[10px] text-white/70">Mulai brief Anda</span></Link></div>
          </section>
        </div>
      </div>
    </div>
  );
}
