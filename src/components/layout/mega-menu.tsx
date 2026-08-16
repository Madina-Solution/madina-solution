"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Palette,
  Printer,
  Megaphone,
  Sparkles,
  Package,
  ArrowRight,
} from "lucide-react";

const MEGA_MENU_DATA = [
  {
    category: "Design",
    slug: "design",
    description: "Identitas visual profesional",
    icon: Palette,
    color: "from-blue-500 to-blue-600",
    items: [
      { name: "Logo Design", href: "/products?category=design&q=logo" },
      { name: "Brand Identity", href: "/services/brand-identity" },
      { name: "Social Media Design", href: "/services/social-media-design" },
      { name: "Company Profile", href: "/services/design" },
      { name: "Packaging Design", href: "/services/packaging-design" },
    ],
  },
  {
    category: "Digital Printing",
    slug: "printing",
    description: "Cetak berkualitas premium",
    icon: Printer,
    color: "from-green-500 to-green-600",
    items: [
      { name: "Banner", href: "/products?category=banner" },
      { name: "Sticker", href: "/products?category=sticker" },
      { name: "Kartu Nama", href: "/products?category=kartu-nama" },
      { name: "Brosur", href: "/products?category=brosur" },
      { name: "Undangan", href: "/products?category=undangan" },
      { name: "Poster", href: "/products?category=poster" },
    ],
  },
  {
    category: "Advertising",
    slug: "advertising",
    description: "Media promosi indoor & outdoor",
    icon: Megaphone,
    color: "from-purple-500 to-purple-600",
    items: [
      { name: "Neon Box", href: "/products?category=signage&q=neon" },
      { name: "Signage", href: "/products?category=signage" },
      { name: "Outdoor Advertising", href: "/services/advertising" },
      { name: "Backdrop", href: "/products?q=backdrop" },
      { name: "X-Banner", href: "/products?q=x-banner" },
    ],
  },
  {
    category: "Branding",
    slug: "branding",
    description: "Solusi branding menyeluruh",
    icon: Sparkles,
    color: "from-orange-500 to-orange-600",
    items: [
      { name: "Brand Identity", href: "/services/brand-identity" },
      { name: "Corporate Identity", href: "/services/branding" },
      { name: "Packaging", href: "/services/packaging-design" },
      { name: "Merchandise", href: "/products?category=branding" },
      { name: "Promotional Kit", href: "/services/business" },
    ],
  },
  {
    category: "Paket Bisnis",
    slug: "business",
    description: "Paket hemat untuk UMKM & corporate",
    icon: Package,
    color: "from-pink-500 to-pink-600",
    items: [
      { name: "Business Starter", href: "/services/business" },
      { name: "UMKM Package", href: "/services/business" },
      { name: "Corporate Package", href: "/services/business" },
      { name: "Event Package", href: "/services/business" },
    ],
  },
];

export function MegaMenu() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute left-1/2 top-full z-50 w-[900px] -translate-x-1/2 pt-3"
    >
      <div className="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-premium-lg">
        <div className="grid grid-cols-12 gap-0">
          {/* Left: Categories */}
          <div className="col-span-3 border-r border-dark-100 bg-dark-50 p-4">
            <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
              Kategori Layanan
            </h3>
            <div className="space-y-1">
              {MEGA_MENU_DATA.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/services/${cat.slug}`}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} text-white transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-dark">
                        {cat.category}
                      </p>
                      <p className="truncate text-xs text-dark-500">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center: Featured services */}
          <div className="col-span-6 grid grid-cols-2 gap-0">
            {MEGA_MENU_DATA.slice(0, 4).map((cat) => (
              <div
                key={cat.slug}
                className="border-b border-r border-dark-100 p-5 last:border-b-0"
              >
                <h4 className="text-sm font-semibold text-dark">
                  {cat.category}
                </h4>
                <p className="mt-1 text-xs text-dark-500">
                  {cat.description}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {cat.items.slice(0, 4).map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-1.5 text-sm text-dark-600 transition-colors hover:text-primary"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-dark-300 transition-colors group-hover:bg-primary" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right: Featured CTA */}
          <div className="col-span-3 bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
            <Sparkles className="h-8 w-8 text-white/80" />
            <h3 className="mt-3 text-lg font-bold">
              Bangun Identitas Bisnis Anda
            </h3>
            <p className="mt-2 text-sm text-white/80">
              Konsultasi gratis untuk kebutuhan desain dan cetak bisnis Anda.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary transition-transform hover:scale-105"
            >
              Konsultasi Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between border-t border-dark-100 bg-dark-50 px-6 py-3">
          <p className="text-sm text-dark-500">
            Butuh solusi khusus? Tim kami siap membantu.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Jelajahi Semua Layanan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
