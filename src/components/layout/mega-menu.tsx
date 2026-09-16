"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, MessageCircleQuestion } from "lucide-react";
import { QUICK_NAV_SERVICES, QUICK_NAV_PRODUCTS, QUICK_NAV_EXPLORE, type QuickNavItem } from "@/lib/navigation";
import { NAV_ICON_MAP } from "@/lib/nav-icons";

type MegaMenuProps = { navigation?: { services: QuickNavItem[]; products: QuickNavItem[]; explore: QuickNavItem[] } };

export function MegaMenu({ navigation = { services: QUICK_NAV_SERVICES, products: QUICK_NAV_PRODUCTS, explore: QUICK_NAV_EXPLORE } }: MegaMenuProps) {
  const sections = [
    { key: "services", label: "Layanan", title: "Jasa desain & branding", description: "Pilih kebutuhan layanan seperti pada menu mobile.", items: navigation.services, footer: ["/services", "Semua layanan"] },
    { key: "products", label: "Produk", title: "Katalog cetak & advertising", description: "Browse produk berdasarkan kategori yang paling relevan.", items: navigation.products, footer: ["/products", "Semua produk"] },
    { key: "explore", label: "Eksplor", title: "Portfolio, insight & company", description: "Kenali karya, artikel, FAQ, dan informasi perusahaan.", items: navigation.explore, footer: ["/contact", "Butuh rekomendasi?"] },
  ] as const;

  return <div className="absolute left-1/2 top-full z-50 w-[min(1060px,calc(100vw-2rem))] -translate-x-1/2 pt-3">
    <div className="overflow-hidden rounded-3xl border border-dark-200 bg-white shadow-2xl ring-1 ring-black/5">
      <div className="grid grid-cols-3 divide-x divide-dark-100">
        {sections.map((section) => <section key={section.key} className="flex min-w-0 flex-col p-5 xl:p-6">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">{section.label}</p><h3 className="mt-1 text-sm font-black text-dark-900">{section.title}</h3><p className="mt-1.5 text-xs leading-5 text-dark-500">{section.description}</p></div>
          <div className={`mt-4 flex-1 ${section.key === "products" ? "grid grid-cols-2 gap-1" : "space-y-1"}`}>
            {section.items.map((item) => { const Icon = NAV_ICON_MAP[item.icon]; return <Link key={item.href} href={item.href} className="group flex min-w-0 items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-50 text-dark-500 group-hover:bg-primary group-hover:text-white"><Icon className="h-4 w-4"/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-dark-800 group-hover:text-primary">{item.name}</span>{item.description && <span className="block truncate text-[10px] text-dark-400">{item.description}</span>}</span>{section.key !== "products" && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-dark-300 group-hover:text-primary"/>}
            </Link>; })}
          </div>
          {section.key !== "explore" ? <Link href={section.footer[0]} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">{section.footer[1]}<ArrowRight className="h-3.5 w-3.5"/></Link> : <Link href={section.footer[0]} className="mt-4 flex items-center justify-between rounded-2xl bg-dark-900 px-4 py-3 text-white hover:bg-dark-800"><span className="flex items-center gap-2"><MessageCircleQuestion className="h-4 w-4 text-primary"/><span><span className="block text-xs font-bold">{section.footer[1]}</span><span className="block text-[10px] text-white/60">Konsultasikan kebutuhan bisnis Anda</span></span></span><ArrowRight className="h-4 w-4 text-primary"/></Link>}
        </section>)}
      </div>
    </div>
  </div>;
}
