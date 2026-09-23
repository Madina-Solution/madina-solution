import Link from "next/link";
import { MapPin, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { BrandMark } from "@/components/layout/brand-mark";
import { SERVICE_NAV_GROUPS } from "@/lib/navigation";
import { NewsletterForm } from "./newsletter-form";
import { CookiePreferencesButton } from "@/components/consent/cookie-consent";

type FooterProps = {
  siteName?: string;
  siteLogo?: string;
  siteEmail?: string;
  sitePhone?: string;
  siteWhatsapp?: string;
  siteAddress?: string;
  siteTagline?: string;
};

function whatsappHref(number: string) {
  const normalized = number.replace(/\D/g, "");
  return `https://wa.me/${normalized}`;
}

export function Footer({
  siteName = BRAND.name,
  siteLogo = "",
  siteEmail = BRAND.email,
  sitePhone = "+62 813-9300-5035",
  siteWhatsapp = BRAND.whatsapp,
  siteAddress = BRAND.address,
  siteTagline = BRAND.tagline,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const contactButtons = [
    {
      href: whatsappHref(siteWhatsapp),
      label: "WhatsApp",
      icon: MessageCircle,
      external: true,
    },
    {
      href: `mailto:${siteEmail}`,
      label: "Email",
      icon: Mail,
      external: false,
    },
  ];

  return (
    <footer className="bg-dark text-white">
      <div className="border-b border-dark-700">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-6">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Tetap Terhubung</p>
              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">Dapatkan Update & Penawaran Terbaru</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Berlangganan newsletter kami untuk tips bisnis, inspirasi desain, dan informasi layanan terbaru.</p>
            </div>
            <div className="w-full max-w-md lg:w-auto">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:text-left">
          <div className="lg:col-span-2 text-center lg:text-left">
            <Link href="/" className="inline-flex" aria-label={`${siteName} Home`}>
              <BrandMark siteLogo={siteLogo} siteName={siteName} tagline={siteTagline} logoClassName="h-12 w-16 sm:h-14 sm:w-20" className="justify-center lg:justify-start [&>span:nth-child(2)>span:first-child]:text-white [&>span:nth-child(2)>span:last-child]:text-dark-400" />
            </Link>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-dark-300 lg:mx-0 lg:max-w-sm">{BRAND.description}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {contactButtons.map(({ href, label, icon: Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dark-700 px-4 py-2.5 text-sm font-semibold text-dark-100 transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark touch-manipulation"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="mb-4 font-semibold">Layanan</h3>
            <ul className="space-y-3">
              {SERVICE_NAV_GROUPS.map((group) => (
                <li key={group.slug}><Link href={group.items[0]?.href || "/services"} className="inline-block text-sm text-dark-300 transition-colors hover:text-primary">{group.category}</Link></li>
              ))}
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="mb-4 font-semibold">Perusahaan</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="inline-block text-sm text-dark-300 transition-colors hover:text-primary">Tentang Kami</Link></li>
              <li><Link href="/portfolio" className="inline-block text-sm text-dark-300 transition-colors hover:text-primary">Portfolio</Link></li>
              <li><Link href="/blog" className="inline-block text-sm text-dark-300 transition-colors hover:text-primary">Blog</Link></li>
              <li><Link href="/faq" className="inline-block text-sm text-dark-300 transition-colors hover:text-primary">FAQ</Link></li>
              <li><Link href="/contact" className="inline-block text-sm text-dark-300 transition-colors hover:text-primary">Kontak</Link></li>
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="mb-4 font-semibold">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start justify-center gap-3 lg:justify-start">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="max-w-sm text-sm leading-6 text-dark-300">{siteAddress}</span>
              </li>
              <li>
                <a href={whatsappHref(siteWhatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-3 text-sm font-medium text-dark-300 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 touch-manipulation">
                  <MessageCircle className="h-5 w-5 text-primary" /><span>{sitePhone}</span><ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={`mailto:${siteEmail}`} className="inline-flex min-h-11 max-w-full items-center justify-center gap-3 text-sm font-medium text-dark-300 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 break-all touch-manipulation">
                  <Mail className="h-5 w-5 shrink-0 text-primary" /><span>{siteEmail}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-7 text-center lg:flex-row lg:justify-between lg:px-6 lg:text-left">
          <p className="text-sm leading-6 text-dark-400">© {currentYear} {siteName}. Hak cipta dilindungi.</p>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-dark-400 lg:w-auto lg:justify-end">
            <Link href="/privacy" className="rounded-lg px-1 py-1 hover:text-primary">Kebijakan Privasi</Link>
            <Link href="/terms" className="rounded-lg px-1 py-1 hover:text-primary">Syarat & Ketentuan</Link>
            <Link href="/refund-policy" className="rounded-lg px-1 py-1 hover:text-primary">Pengembalian</Link>
            <Link href="/shipping-policy" className="rounded-lg px-1 py-1 hover:text-primary">Pengiriman</Link>
            <Link href="/cookies" className="rounded-lg px-1 py-1 hover:text-primary">Kebijakan Cookie</Link>
            <CookiePreferencesButton className="rounded-lg px-1 py-1 hover:text-primary" />
          </div>
        </div>
      </div>
    </footer>
  );
}
