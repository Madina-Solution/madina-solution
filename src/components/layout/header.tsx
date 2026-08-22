"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSearch } from "@/components/search/search-provider";
import { useCart } from "@/lib/cart/cart-provider";
import { useAuth } from "@/lib/auth/auth-provider";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const { openSearch } = useSearch();
  const { state: cartState, openDrawer: openCartDrawer } = useCart();
  const { user } = useAuth();
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMenuEnter = (label: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (label === "Layanan") {
      setActiveMenu("services");
    }
  };

  const handleMenuLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="hidden border-b border-dark-100 bg-dark text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-sm">
          <div className="flex items-center gap-6">
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>+62 813-9300-5035</span>
            </a>
            <span className="text-dark-600">|</span>
            <a
              href={`mailto:${BRAND.email}`}
              className="transition-colors hover:text-primary"
            >
              {BRAND.email}
            </a>
          </div>
          <p className="text-dark-300">
            Creative Business Platform untuk kebutuhan bisnis Anda
          </p>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "glass border-b border-dark-100 shadow-premium"
            : "bg-white border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="Madina Solution Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-premium">
              <span className="text-lg font-bold">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold leading-tight text-dark">
                {BRAND.name}
              </h1>
              <p className="text-xs text-dark-500">{BRAND.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden flex-1 items-center justify-center lg:flex"
            aria-label="Main navigation"
          >
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(item.label)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-dark-700 transition-colors hover:bg-dark-50 hover:text-dark"
                    aria-haspopup={item.label === "Layanan" ? "true" : undefined}
                    aria-controls={item.label === "Layanan" ? "services-mega-menu" : undefined}
                    aria-expanded={
                      item.label === "Layanan" && activeMenu === "services"
                    }
                    onFocus={() => handleMenuEnter(item.label)}
                  >
                    {item.label}
                    {item.label === "Layanan" && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          activeMenu === "services" && "rotate-180"
                        )}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <AnimatePresence>
              {activeMenu === "services" && (
                <div
                  id="services-mega-menu"
                  onMouseEnter={() => handleMenuEnter("Layanan")}
                  onMouseLeave={handleMenuLeave}
                >
                  <MegaMenu />
                </div>
              )}
            </AnimatePresence>
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={openSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Cart"
              onClick={openCartDrawer}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartState.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cartState.itemCount > 9 ? "9+" : cartState.itemCount}
                </span>
              )}
            </Button>

            {user ? (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                asChild
                aria-label="Akun Saya"
              >
                <Link href="/account">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                asChild
                aria-label="Masuk"
              >
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button size="sm" className="hidden lg:flex" asChild>
              <Link href="/contact">
                Mulai Pesanan
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
