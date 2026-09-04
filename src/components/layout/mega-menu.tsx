"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, MessageCircleQuestion } from "lucide-react";
import { QUICK_NAV_SERVICES, QUICK_NAV_PRODUCTS, QUICK_NAV_EXPLORE, type QuickNavItem } from "@/lib/navigation";
import { NAV_ICON_MAP } from "@/lib/nav-icons";

type MegaMenuProps = {
  navigation?: { services: QuickNavItem[]; products: QuickNavItem[]; explore: QuickNavItem[] };
};

/**
 * Desktop Mega Menu.
 *
 * Three equal-width columns, symmetric and centered under the "Layanan"
 * trigger: Layanan (real services only) / Produk (product categories only)
 * / Eksplor (portfolio, blog, FAQ, company — each listed exactly once).
 * Icons only — no product photography — so the panel stays fast, consistent
 * with the Mobile Nav, and never depends on a network round-trip to render.
 *
 * Content comes from the `navigation` prop (admin-managed, fetched
 * server-side in the public layout via getPublicNavigation()). The static
 * QUICK_NAV_* arrays are only a default/fallback for callers that don't
 * pass the prop.
 */
export function MegaMenu({ navigation = { services: QUICK_NAV_SERVICES, products: QUICK_NAV_PRODUCTS, explore: QUICK_NAV_EXPLORE } }: MegaMenuProps) {
  const { services, products, explore } = navigation;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="absolute left-1/2 top-full z-50 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 pt-3"
    >
      <div className="overflow-hidden rounded-[28px] border border-dark-200/80 bg-white/95 shadow-2xl shadow-dark/10 ring-1 ring-black/5 backdrop-blur">
        <div className="grid grid-cols-3 divide-x divide-dark-100">
          {/* Layanan — real services only */}
          <section className="flex flex-col p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Layanan</p>
              <h3 className="mt-1 text-sm font-bold text-dark-900">Jasa desain &amp; branding</h3>
              <p className="mt-1.5 text-xs leading-5 text-dark-500">Empat layanan inti dari ide sampai file siap pakai.</p>
            </div>
            <div className="mt-4 flex-1 space-y-1">
              {services.map((item) => {
                const Icon = NAV_ICON_MAP[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group/item flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-primary-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover/item:bg-primary group-hover/item:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-dark-900 group-hover/item:text-primary">{item.name}</span>
                      {item.description ? <span className="block truncate text-[11px] text-dark-400">{item.description}</span> : null}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-dark-300 transition group-hover/item:translate-x-0.5 group-hover/item:text-primary" />
                  </Link>
                );
              })}
            </div>
            <Link href="/services" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Semua layanan<ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {/* Produk — product categories only */}
          <section className="flex flex-col p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Produk</p>
              <h3 className="mt-1 text-sm font-bold text-dark-900">Katalog cetak &amp; advertising</h3>
              <p className="mt-1.5 text-xs leading-5 text-dark-500">Kategori produk paling sering dipesan.</p>
            </div>
            <div className="mt-4 flex-1 grid grid-cols-2 gap-1">
              {products.map((item) => {
                const Icon = NAV_ICON_MAP[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group/item flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-primary-50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dark-50 text-dark-500 transition group-hover/item:bg-primary group-hover/item:text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 truncate text-xs font-medium text-dark-700 group-hover/item:text-primary">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Lihat semua produk<ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {/* Eksplor — portfolio, blog, faq, company. Each item appears once. */}
          <section className="flex flex-col p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Eksplor</p>
              <h3 className="mt-1 text-sm font-bold text-dark-900">Kenali &amp; hubungi kami</h3>
            </div>
            <div className="mt-4 flex-1 space-y-1">
              {explore.map((item) => {
                const Icon = NAV_ICON_MAP[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group/item flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-dark-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark-50 text-dark-600 transition group-hover/item:bg-dark-900 group-hover/item:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 truncate text-xs font-semibold text-dark-800 group-hover/item:text-primary">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4">
              <Link href="/contact" className="flex items-center justify-between rounded-2xl bg-dark-900 px-4 py-3 text-white transition hover:bg-dark-800">
                <span className="flex items-center gap-2">
                  <MessageCircleQuestion className="h-4 w-4 text-primary" />
                  <span>
                    <span className="block text-xs font-semibold">Butuh rekomendasi?</span>
                    <span className="block text-[10px] text-white/60">Konsultasi kebutuhan bisnis Anda</span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
