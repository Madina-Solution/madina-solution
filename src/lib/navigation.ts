export type NavigationItem = {
  name: string;
  href: string;
};

export type NavigationGroup = {
  category: string;
  slug: string;
  description: string;
  color: string;
  icon: "design" | "printing" | "advertising" | "branding" | "business";
  items: NavigationItem[];
};

/**
 * Public navigation contract.
 *
 * IMPORTANT: every href in this file is intentionally limited to routes that
 * exist in the application or to product/service URLs backed by seeded data.
 * Keep this file as the single source of truth for desktop/mobile marketing
 * navigation. Do not invent category routes here unless the corresponding
 * route and data model are implemented.
 */
export const SERVICE_NAV_GROUPS: NavigationGroup[] = [
  {
    category: "Design",
    slug: "design",
    description: "Identitas visual profesional",
    color: "from-blue-500 to-blue-600",
    icon: "design",
    items: [
      { name: "Logo Design", href: "/services/logo-design" },
      { name: "Brand Identity", href: "/services/brand-identity" },
      { name: "Social Media Design", href: "/services/social-media-design" },
      { name: "Packaging Design", href: "/services/packaging-design" },
    ],
  },
  {
    category: "Digital Printing",
    slug: "printing",
    description: "Cetak berkualitas premium",
    color: "from-green-500 to-green-600",
    icon: "printing",
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
    color: "from-purple-500 to-purple-600",
    icon: "advertising",
    items: [
      { name: "Neon Box", href: "/products?category=signage&q=neon" },
      { name: "Signage", href: "/products?category=signage" },
      { name: "X-Banner", href: "/products?q=x-banner" },
      { name: "Spanduk", href: "/products?q=spanduk" },
    ],
  },
  {
    category: "Branding",
    slug: "branding",
    description: "Solusi branding menyeluruh",
    color: "from-orange-500 to-orange-600",
    icon: "branding",
    items: [
      { name: "Brand Identity", href: "/services/brand-identity" },
      { name: "Packaging Design", href: "/services/packaging-design" },
      { name: "Social Media Design", href: "/services/social-media-design" },
    ],
  },
  {
    category: "Paket Bisnis",
    slug: "business",
    description: "Solusi konsultasi untuk UMKM & corporate",
    color: "from-pink-500 to-pink-600",
    icon: "business",
    items: [
      { name: "Konsultasi Paket UMKM", href: "/contact" },
      { name: "Konsultasi Corporate", href: "/contact" },
      { name: "Konsultasi Event", href: "/contact" },
    ],
  },
];

export const ALL_PUBLIC_NAV_HREFS = [
  "/",
  "/services",
  "/products",
  "/portfolio",
  "/about",
  "/contact",
  "/blog",
  "/faq",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/account",
] as const;
