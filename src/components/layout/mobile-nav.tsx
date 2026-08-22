"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  User,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  Palette,
  Printer,
  Megaphone,
  Sparkles,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_NAV_GROUPS } from "@/lib/navigation";
import { BRAND } from "@/lib/constants";
import { useSearch } from "@/components/search/search-provider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SERVICE_NAV = SERVICE_NAV_GROUPS;

export function MobileNav({ isOpen, onClose }: Props) {
  const { openSearch } = useSearch();
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    setExpandedCategory(null);
    onClose();
  }, [onClose]);

  const handleSearch = () => {
    onClose();
    openSearch();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-premium-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-100 p-4">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white">
                  <span className="text-base font-bold">M</span>
                </div>
                <span className="font-bold text-dark">{BRAND.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-dark-500 transition-colors hover:bg-dark-100 hover:text-dark"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-dark-100 p-4">
              <button
                onClick={handleSearch}
                className="flex w-full items-center gap-3 rounded-xl bg-dark-50 px-4 py-3 text-left transition-colors hover:bg-dark-100"
              >
                <Search className="h-5 w-5 text-dark-400" />
                <span className="text-sm text-dark-500">
                  Cari produk atau layanan...
                </span>
              </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin" aria-label="Mobile menu">
              <ul className="px-2 py-3">
                <li>
                  <Link
                    href="/"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                  >
                    Produk
                  </Link>
                </li>

                {/* Services Accordion */}
                <li>
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === "services" ? null : "services"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                    aria-expanded={expandedCategory === "services"}
                  >
                    Layanan
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedCategory === "services" && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedCategory === "services" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pb-2 pl-4 pr-2">
                          {SERVICE_NAV.map((cat) => {
                            const Icon = { design: Palette, printing: Printer, advertising: Megaphone, branding: Sparkles, business: Package }[cat.icon];
                            return (
                              <Link
                                key={cat.category}
                                href={cat.items[0]?.href || "/services"}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-dark-600 transition-colors hover:bg-dark-50"
                              >
                                <div
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-md text-white",
                                    cat.color
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span>{cat.category}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>

                <li>
                  <Link
                    href="/portfolio"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                  >
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                  >
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                  >
                    Kontak
                  </Link>
                </li>
              </ul>

              {/* Contact Shortcut */}
              <div className="mx-4 mb-4 rounded-2xl bg-dark-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-500">
                  Hubungi Kami
                </p>
                <div className="mt-3 space-y-2">
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-dark-700 transition-colors hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                    +62 813-9300-5035
                  </a>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="flex items-center gap-3 text-sm text-dark-700 transition-colors hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {BRAND.email}
                  </a>
                </div>
              </div>
            </nav>

            {/* Footer Actions */}
            <div className="space-y-2 border-t border-dark-100 p-4">
              <Link
                href="/contact"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Mulai Pesanan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dark-200 bg-white py-2.5 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50"
                >
                  <User className="h-4 w-4" />
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dark-200 bg-dark py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark-800"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
