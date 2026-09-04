import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/constants";
import { SearchProvider } from "@/components/search/search-provider";
import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/lib/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { getPublicSiteConfig } from "@/lib/site-config";
import { getSiteUrl, parseKeywords, normalizeDescription } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});


export async function generateMetadata(): Promise<Metadata> {
  type SiteMetadataConfig = {
    siteName: string;
    siteTagline: string;
    siteUrl: string;
    siteLogo: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    seoOgImage: string;
    seoTwitterHandle: string;
  };
  let config: SiteMetadataConfig = {
    siteName: BRAND.name,
    siteTagline: BRAND.tagline,
    siteUrl: getSiteUrl(),
    siteLogo: "",
    seoTitle: "",
    seoDescription: BRAND.description,
    seoKeywords: "Madina Solution, desain grafis, digital printing, branding, advertising, percetakan Temanggung, cetak banner, cetak sticker, kartu nama, desain logo",
    seoOgImage: "",
    seoTwitterHandle: "",
  };
  try {
    const site = await getPublicSiteConfig();
    config = { ...config, ...site };
  } catch {
    // Keep deterministic safe defaults when the database is unavailable.
  }
  const title = config.seoTitle || `${config.siteName} — ${config.siteTagline}`;
  const description = normalizeDescription(config.seoDescription || BRAND.description);
  const siteUrl = config.siteUrl || getSiteUrl();
  const image = config.seoOgImage || "/opengraph-image";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${config.siteName}` },
    description,
    keywords: parseKeywords(config.seoKeywords),
    authors: [{ name: config.siteName }],
    creator: config.siteName,
    publisher: config.siteName,
    category: "business",
    applicationName: config.siteName,
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, telephone: false, address: false },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: config.siteName,
      title,
      description,
      url: siteUrl,
      images: [{ url: image, width: 1200, height: 630, alt: `${config.siteName} — ${config.siteTagline}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      ...(config.seoTwitterHandle ? { creator: config.seoTwitterHandle, site: config.seoTwitterHandle } : {}),
    },
    // Favicon mirrors the branding logo configured in Admin → Pengaturan.
    // Falls back to the static brand-mark SVGs only when no logo is set yet.
    icons: {
      icon: config.siteLogo ? [{ url: config.siteLogo }] : [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: config.siteLogo ? [{ url: config.siteLogo }] : [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    },
    manifest: "/manifest.webmanifest",
    robots: { index: true, follow: true, nocache: false },
    // The root route intentionally has no hard-coded canonical; each indexable route declares its own canonical.
  };
}


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-white font-sans text-dark-900 antialiased">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <SearchProvider>{children}</SearchProvider>
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
